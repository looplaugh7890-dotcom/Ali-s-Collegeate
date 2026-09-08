import { Router } from 'express';
import { User } from '../models/User.js';
import { Student } from '../models/Student.js';
import { Course } from '../models/Course.js';
import { Application } from '../models/Application.js';
import { Assignment, Submission } from '../models/Assignment.js';
import { Quiz, QuizAttempt } from '../models/Quiz.js';
import { Payment } from '../models/Payment.js';
import { Contact } from '../models/Contact.js';
import { authenticate, authorize } from '../middleware/auth.js';
import { successResponse, errorResponse, parsePagination, paginatedResponse, safeSearchRegex } from '../utils/helpers.js';

const router = Router();
router.use(authenticate);
router.use(authorize('admin'));

// --- Dashboard ---
router.get('/dashboard', async (req, res) => {
  try {
    const [totalStudents, totalCourses, totalApplications, totalPayments, unreadContacts] = await Promise.all([
      Student.countDocuments(),
      Course.countDocuments(),
      Application.countDocuments(),
      Payment.countDocuments({ status: 'paid' }),
      Contact.countDocuments({ isRead: false }),
    ]);
    const [totalRevenue, applicationsByStatus, recentApplications] = await Promise.all([
      Payment.aggregate([
        { $match: { status: 'paid' } },
        { $group: { _id: null, total: { $sum: '$amount' } } },
      ]),
      Application.aggregate([{ $group: { _id: '$status', count: { $sum: 1 } } }]),
      Application.find().sort({ createdAt: -1 }).limit(5)
        .select('applicationNumber firstName lastName status program createdAt'),
    ]);
    res.json(successResponse({
      totalStudents,
      totalCourses,
      totalApplications,
      totalPayments,
      totalRevenue: totalRevenue[0]?.total || 0,
      unreadContacts,
      recentApplications,
      applicationsByStatus,
    }));
  } catch (error) {
    res.status(500).json(errorResponse(error.message));
  }
});

// --- Users ---
router.get('/users', async (req, res) => {
  try {
    const { search } = req.query;
    const filter = {};
    const regex = safeSearchRegex(search);
    if (regex) filter.$or = [{ name: regex }, { email: regex }];
    const { page, limit, skip } = parsePagination(req.query);
    const [data, total] = await Promise.all([
      User.find(filter).sort({ createdAt: -1 }).skip(skip).limit(limit),
      User.countDocuments(filter),
    ]);
    res.json(paginatedResponse(data, total, page, limit));
  } catch (error) {
    res.status(500).json(errorResponse(error.message));
  }
});

router.post('/users', async (req, res) => {
  try {
    const { name, email, password, role } = req.body;
    if (!name || !email || !password) {
      return res.status(400).json(errorResponse('Name, email and password are required', 400));
    }
    const allowedRoles = ['student', 'teacher', 'admin'];
    if (role && !allowedRoles.includes(role)) {
      return res.status(400).json(errorResponse(`Invalid role. Must be one of: ${allowedRoles.join(', ')}`, 400));
    }
    const user = await User.create({ name, email, password, role: role || 'student' });
    res.status(201).json(successResponse(user, 'User created', 201));
  } catch (error) {
    res.status(400).json(errorResponse(error.message, 400));
  }
});

router.put('/users/:id', async (req, res) => {
  try {
    const updates = { ...req.body };
    delete updates.password;
    delete updates.role; // Prevent role escalation
    const user = await User.findByIdAndUpdate(req.params.id, updates, { new: true, runValidators: true });
    if (!user) return res.status(404).json(errorResponse('User not found', 404));
    res.json(successResponse(user, 'User updated'));
  } catch (error) {
    res.status(400).json(errorResponse(error.message, 400));
  }
});

router.delete('/users/:id', async (req, res) => {
  try {
    const user = await User.findByIdAndDelete(req.params.id);
    if (!user) return res.status(404).json(errorResponse('User not found', 404));
    res.json(successResponse(null, 'User deleted'));
  } catch (error) {
    res.status(500).json(errorResponse(error.message));
  }
});

// --- Students ---
router.get('/students', async (req, res) => {
  try {
    const { search } = req.query;
    const filter = {};
    const regex = safeSearchRegex(search);
    if (regex) {
      filter.$or = [
        { rollNumber: regex },
        { className: regex },
      ];
    }
    // Also search by user name/email through a join
    let studentIds = null;
    if (regex) {
      const matchingUsers = await User.find({ $or: [{ name: regex }, { email: regex }] }).select('_id');
      studentIds = matchingUsers.map((u) => u._id);
      if (studentIds.length > 0) {
        filter.$or = [...(filter.$or || []), { user: { $in: studentIds } }];
      } else if (!filter.$or) {
        // No matching users, return empty
        return res.json(paginatedResponse([], 0, 1, 20));
      }
    }
    const { page, limit, skip } = parsePagination(req.query);
    const [data, total] = await Promise.all([
      Student.find(filter).populate('user').sort({ createdAt: -1 }).skip(skip).limit(limit),
      Student.countDocuments(filter),
    ]);
    res.json(paginatedResponse(data, total, page, limit));
  } catch (error) {
    res.status(500).json(errorResponse(error.message));
  }
});

router.post('/students', async (req, res) => {
  try {
    const student = await Student.create(req.body);
    res.status(201).json(successResponse(student, 'Student created', 201));
  } catch (error) {
    res.status(400).json(errorResponse(error.message, 400));
  }
});

router.put('/students/:id', async (req, res) => {
  try {
    const student = await Student.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });
    if (!student) return res.status(404).json(errorResponse('Student not found', 404));
    res.json(successResponse(student, 'Student updated'));
  } catch (error) {
    res.status(400).json(errorResponse(error.message, 400));
  }
});

// --- Assignments ---
router.get('/assignments', async (req, res) => {
  try {
    const { search } = req.query;
    const filter = {};
    const regex = safeSearchRegex(search);
    if (regex) filter.title = regex;
    const { page, limit, skip } = parsePagination(req.query);
    const [data, total] = await Promise.all([
      Assignment.find(filter).populate('course', 'title slug').sort({ createdAt: -1 }).skip(skip).limit(limit),
      Assignment.countDocuments(filter),
    ]);
    res.json(paginatedResponse(data, total, page, limit));
  } catch (error) {
    res.status(500).json(errorResponse(error.message));
  }
});

router.post('/assignments', async (req, res) => {
  try {
    const assignment = await Assignment.create(req.body);
    res.status(201).json(successResponse(assignment, 'Assignment created', 201));
  } catch (error) {
    res.status(400).json(errorResponse(error.message, 400));
  }
});

router.put('/assignments/:id', async (req, res) => {
  try {
    const assignment = await Assignment.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });
    if (!assignment) return res.status(404).json(errorResponse('Assignment not found', 404));
    res.json(successResponse(assignment, 'Assignment updated'));
  } catch (error) {
    res.status(400).json(errorResponse(error.message, 400));
  }
});

router.delete('/assignments/:id', async (req, res) => {
  try {
    const assignment = await Assignment.findByIdAndDelete(req.params.id);
    if (!assignment) return res.status(404).json(errorResponse('Assignment not found', 404));
    res.json(successResponse(null, 'Assignment deleted'));
  } catch (error) {
    res.status(500).json(errorResponse(error.message));
  }
});

// --- Submissions ---
router.get('/submissions', async (req, res) => {
  try {
    const { page, limit, skip } = parsePagination(req.query);
    const [data, total] = await Promise.all([
      Submission.find()
        .populate('assignment', 'title')
        .populate({ path: 'student', populate: { path: 'user', select: 'name email' } })
        .sort({ submittedAt: -1 })
        .skip(skip)
        .limit(limit),
      Submission.countDocuments(),
    ]);
    res.json(paginatedResponse(data, total, page, limit));
  } catch (error) {
    res.status(500).json(errorResponse(error.message));
  }
});

router.put('/submissions/:id/grade', async (req, res) => {
  try {
    const { marks, feedback } = req.body;
    if (marks === undefined || marks === null) {
      return res.status(400).json(errorResponse('Marks are required', 400));
    }
    const submission = await Submission.findByIdAndUpdate(
      req.params.id,
      { marks, feedback, status: 'graded', gradedAt: new Date() },
      { new: true, runValidators: true }
    );
    if (!submission) return res.status(404).json(errorResponse('Submission not found', 404));
    res.json(successResponse(submission, 'Submission graded'));
  } catch (error) {
    res.status(400).json(errorResponse(error.message, 400));
  }
});

// --- Quizzes ---
router.get('/quizzes', async (req, res) => {
  try {
    const { search } = req.query;
    const filter = {};
    const regex = safeSearchRegex(search);
    if (regex) filter.title = regex;
    const { page, limit, skip } = parsePagination(req.query);
    const [data, total] = await Promise.all([
      Quiz.find(filter).populate('course', 'title slug').sort({ createdAt: -1 }).skip(skip).limit(limit),
      Quiz.countDocuments(filter),
    ]);
    res.json(paginatedResponse(data, total, page, limit));
  } catch (error) {
    res.status(500).json(errorResponse(error.message));
  }
});

router.post('/quizzes', async (req, res) => {
  try {
    const quiz = await Quiz.create(req.body);
    res.status(201).json(successResponse(quiz, 'Quiz created', 201));
  } catch (error) {
    res.status(400).json(errorResponse(error.message, 400));
  }
});

router.put('/quizzes/:id', async (req, res) => {
  try {
    const quiz = await Quiz.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });
    if (!quiz) return res.status(404).json(errorResponse('Quiz not found', 404));
    res.json(successResponse(quiz, 'Quiz updated'));
  } catch (error) {
    res.status(400).json(errorResponse(error.message, 400));
  }
});

router.delete('/quizzes/:id', async (req, res) => {
  try {
    const quiz = await Quiz.findByIdAndDelete(req.params.id);
    if (!quiz) return res.status(404).json(errorResponse('Quiz not found', 404));
    res.json(successResponse(null, 'Quiz deleted'));
  } catch (error) {
    res.status(500).json(errorResponse(error.message));
  }
});

// --- Quiz Questions ---
router.post('/quizzes/:quizId/questions', async (req, res) => {
  try {
    const quiz = await Quiz.findById(req.params.quizId);
    if (!quiz) return res.status(404).json(errorResponse('Quiz not found', 404));
    quiz.questions.push(req.body);
    await quiz.save();
    res.status(201).json(successResponse(quiz, 'Question added', 201));
  } catch (error) {
    res.status(400).json(errorResponse(error.message, 400));
  }
});

router.put('/quizzes/:quizId/questions/:questionId', async (req, res) => {
  try {
    const quiz = await Quiz.findById(req.params.quizId);
    if (!quiz) return res.status(404).json(errorResponse('Quiz not found', 404));
    const question = quiz.questions.id(req.params.questionId);
    if (!question) return res.status(404).json(errorResponse('Question not found', 404));
    Object.assign(question, req.body);
    await quiz.save();
    res.json(successResponse(quiz, 'Question updated'));
  } catch (error) {
    res.status(400).json(errorResponse(error.message, 400));
  }
});

router.delete('/quizzes/:quizId/questions/:questionId', async (req, res) => {
  try {
    const quiz = await Quiz.findById(req.params.quizId);
    if (!quiz) return res.status(404).json(errorResponse('Quiz not found', 404));
    quiz.questions.pull(req.params.questionId);
    await quiz.save();
    res.json(successResponse(null, 'Question deleted'));
  } catch (error) {
    res.status(500).json(errorResponse(error.message));
  }
});

// --- Payments ---
router.get('/payments', async (req, res) => {
  try {
    const { status, search } = req.query;
    const filter = {};
    if (status) filter.status = status;
    const regex = safeSearchRegex(search);
    if (regex) filter.$or = [{ reference: regex }, { description: regex }];
    const { page, limit, skip } = parsePagination(req.query);
    const [data, total] = await Promise.all([
      Payment.find(filter).populate('student').sort({ createdAt: -1 }).skip(skip).limit(limit),
      Payment.countDocuments(filter),
    ]);
    res.json(paginatedResponse(data, total, page, limit));
  } catch (error) {
    res.status(500).json(errorResponse(error.message));
  }
});

// --- Contacts ---
router.get('/contacts', async (req, res) => {
  try {
    const { isRead, search } = req.query;
    const filter = {};
    if (isRead !== undefined) filter.isRead = isRead === 'true';
    const regex = safeSearchRegex(search);
    if (regex) filter.$or = [{ name: regex }, { email: regex }, { subject: regex }];
    const { page, limit, skip } = parsePagination(req.query);
    const [data, total] = await Promise.all([
      Contact.find(filter).sort({ createdAt: -1 }).skip(skip).limit(limit),
      Contact.countDocuments(filter),
    ]);
    res.json(paginatedResponse(data, total, page, limit));
  } catch (error) {
    res.status(500).json(errorResponse(error.message));
  }
});

router.put('/contacts/:id/read', async (req, res) => {
  try {
    const contact = await Contact.findByIdAndUpdate(req.params.id, { isRead: true }, { new: true });
    if (!contact) return res.status(404).json(errorResponse('Message not found', 404));
    res.json(successResponse(contact, 'Message marked as read'));
  } catch (error) {
    res.status(400).json(errorResponse(error.message, 400));
  }
});

router.delete('/contacts/:id', async (req, res) => {
  try {
    const contact = await Contact.findByIdAndDelete(req.params.id);
    if (!contact) return res.status(404).json(errorResponse('Message not found', 404));
    res.json(successResponse(null, 'Message deleted'));
  } catch (error) {
    res.status(500).json(errorResponse(error.message));
  }
});

export default router;
