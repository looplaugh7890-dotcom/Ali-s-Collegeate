import { Router } from 'express';
import { Application } from '../models/Application.js';
import { User } from '../models/User.js';
import { Student } from '../models/Student.js';
import { authenticate, authorize } from '../middleware/auth.js';
import { sendEmail, applicationConfirmationEmail, applicationAcceptedEmail, applicationRejectedEmail } from '../utils/email.js';
import { successResponse, errorResponse, generateUniqueNumber, parsePagination, paginatedResponse, safeSearchRegex } from '../utils/helpers.js';

const router = Router();

// Public: Submit application
router.post('/', async (req, res) => {
  try {
    const { firstName, lastName, program, email } = req.body;
    if (!firstName || !lastName || !program) {
      return res.status(400).json(errorResponse('First name, last name and program are required', 400));
    }
    if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return res.status(400).json(errorResponse('Invalid email format', 400));
    }

    // Check if email is already registered as a user
    if (email) {
      const existingUser = await User.findOne({ email: email.toLowerCase().trim() });
      if (existingUser) {
        return res.status(409).json(errorResponse('This email is already registered. Please use a different email or contact support.', 409));
      }
      // Also check if an application with this email already exists
      const existingApp = await Application.findOne({ email: email.toLowerCase().trim() });
      if (existingApp) {
        return res.status(409).json(errorResponse('An application with this email already exists. Check your status using your application number.', 409));
      }
    }

    let application;
    let retries = 3;
    while (retries > 0) {
      try {
        application = await Application.create({
          ...req.body,
          applicationNumber: generateUniqueNumber('TAC'),
        });
        break;
      } catch (err) {
        retries--;
        if (err.code === 11000 && retries > 0) continue;
        throw err;
      }
    }
    if (!application) {
      return res.status(500).json(errorResponse('Failed to generate application number. Please try again.', 500));
    }

    if (email) {
      const emailResult = sendEmail({
        to: email,
        subject: `Application Received — ${application.applicationNumber}`,
        html: applicationConfirmationEmail(application),
      });
      if (emailResult && typeof emailResult.catch === 'function') {
        emailResult.catch((err) => console.error('Confirmation email failed:', err.message));
      }
    }

    res.status(201).json(successResponse(
      { applicationNumber: application.applicationNumber, status: application.status },
      'Application submitted successfully',
      201
    ));
  } catch (error) {
    res.status(400).json(errorResponse(error.message, 400));
  }
});

// Public: Check application status
router.get('/status/:applicationNumber', async (req, res) => {
  try {
    const application = await Application.findOne({
      applicationNumber: req.params.applicationNumber,
    }).select('applicationNumber status program stream firstName lastName createdAt');
    if (!application) {
      return res.status(404).json(errorResponse('Application not found. Please check your application number.', 404));
    }
    res.json(successResponse(application));
  } catch (error) {
    res.status(500).json(errorResponse(error.message));
  }
});

// Admin: List all applications (with search, filter, pagination)
router.get('/', authenticate, authorize('admin'), async (req, res) => {
  try {
    const { status, search } = req.query;
    const filter = {};
    if (status) filter.status = status;
    const regex = safeSearchRegex(search);
    if (regex) {
      filter.$or = [
        { firstName: regex },
        { lastName: regex },
        { applicationNumber: regex },
        { email: regex },
      ];
    }
    const { page, limit, skip } = parsePagination(req.query);
    const [data, total] = await Promise.all([
      Application.find(filter).sort({ createdAt: -1 }).skip(skip).limit(limit),
      Application.countDocuments(filter),
    ]);
    res.json(paginatedResponse(data, total, page, limit));
  } catch (error) {
    res.status(500).json(errorResponse(error.message));
  }
});

// Admin: Get single application
router.get('/:id', authenticate, authorize('admin'), async (req, res) => {
  try {
    const application = await Application.findById(req.params.id);
    if (!application) return res.status(404).json(errorResponse('Application not found', 404));
    res.json(successResponse(application));
  } catch (error) {
    res.status(500).json(errorResponse(error.message));
  }
});

// Admin: Update application status (accept → creates User + Student + sends email)
router.put('/:id/status', authenticate, authorize('admin'), async (req, res) => {
  try {
    const { status, notes } = req.body;
    const allowedStatuses = ['draft', 'submitted', 'under-review', 'accepted', 'rejected'];
    if (status && !allowedStatuses.includes(status)) {
      return res.status(400).json(errorResponse(`Invalid status. Must be one of: ${allowedStatuses.join(', ')}`, 400));
    }

    const application = await Application.findById(req.params.id);
    if (!application) return res.status(404).json(errorResponse('Application not found', 404));

    // If accepting — create User + Student account
    if (status === 'accepted' && application.status !== 'accepted') {
      // Always generate a fresh password
      const tempPassword = `TAC${Math.random().toString(36).slice(-8)}`;
      let user = await User.findOne({ email: application.email });

      if (!user) {
        user = await User.create({
          name: `${application.firstName} ${application.lastName}`,
          email: application.email,
          password: tempPassword,
          role: 'student',
          phone: application.phone || application.guardianPhone,
        });
      } else {
        // Reset password for existing user
        user.password = tempPassword;
        await user.save();
      }

      // Always ensure student profile exists
      let student = await Student.findOne({ user: user._id });
      if (!student) {
        const rollNumber = `TAC-${Date.now().toString(36).toUpperCase()}`;
        student = await Student.create({
          user: user._id,
          rollNumber,
          className: application.program || 'N/A',
          stream: application.stream || '',
          section: application.batch || '',
          guardianName: application.fatherName || '',
          phone: application.guardianPhone || application.phone || '',
          address: application.address || '',
          city: application.city || '',
          gender: application.gender || '',
          previousSchool: application.previousSchool || '',
          lastClassPassed: application.lastClassPassed || '',
          board: application.board || '',
          marksObtained: application.marksObtained || '',
          passingYear: application.passingYear || '',
        });
      }

      // Send acceptance email with credentials
      if (application.email) {
        const passwordLine = `<p style="margin: 5px 0;"><strong>Temporary Password:</strong> <code style="background:#e5e7eb;padding:2px 6px;border-radius:4px;">${tempPassword}</code></p>`;
        const emailResult = sendEmail({
          to: application.email,
          subject: `Application Accepted! — ${application.applicationNumber}`,
          html: applicationAcceptedEmail(application, passwordLine),
        });
        if (emailResult && typeof emailResult.catch === 'function') {
          emailResult.catch((err) => console.error('Acceptance email failed:', err.message));
        }
      }
    }

    // If rejecting — send rejection email
    if (status === 'rejected' && application.status !== 'rejected') {
      if (application.email) {
        const emailResult = sendEmail({
          to: application.email,
          subject: `Application Update — ${application.applicationNumber}`,
          html: applicationRejectedEmail(application),
        });
        if (emailResult && typeof emailResult.catch === 'function') {
          emailResult.catch((err) => console.error('Rejection email failed:', err.message));
        }
      }
    }

    application.status = status;
    application.adminNotes = notes || application.adminNotes;
    application.reviewedBy = req.user._id;
    application.reviewedAt = new Date();
    await application.save();

    res.json(successResponse(application, 'Application status updated'));
  } catch (error) {
    res.status(400).json(errorResponse(error.message, 400));
  }
});

// Admin: Dashboard stats (MUST be before /:id to avoid route conflict)
router.get('/stats/overview', authenticate, authorize('admin'), async (req, res) => {
  try {
    const [total, byStatus, recent] = await Promise.all([
      Application.countDocuments(),
      Application.aggregate([{ $group: { _id: '$status', count: { $sum: 1 } } }]),
      Application.find().sort({ createdAt: -1 }).limit(5).select('applicationNumber firstName lastName status program createdAt'),
    ]);
    res.json(successResponse({ total, byStatus, recent }));
  } catch (error) {
    res.status(500).json(errorResponse(error.message));
  }
});

export default router;
