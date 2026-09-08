import { Router } from 'express';
import jwt from 'jsonwebtoken';
import config from '../config.js';
import { User } from '../models/User.js';
import { Student } from '../models/Student.js';
import { authenticate } from '../middleware/auth.js';
import { successResponse, errorResponse, isValidEmail } from '../utils/helpers.js';

const router = Router();

function generateToken(userId) {
  return jwt.sign({ id: userId }, config.jwtSecret, { expiresIn: config.jwtExpiresIn });
}

router.post('/register', async (req, res) => {
  try {
    const { name, email, password, phone } = req.body;
    if (!name || !email || !password) {
      return res.status(400).json(errorResponse('Name, email and password are required', 400));
    }
    if (!isValidEmail(email)) {
      return res.status(400).json(errorResponse('Invalid email format', 400));
    }
    if (password.length < 6) {
      return res.status(400).json(errorResponse('Password must be at least 6 characters', 400));
    }
    const normalizedEmail = email.toLowerCase().trim();
    const existingUser = await User.findOne({ email: normalizedEmail });
    if (existingUser) {
      return res.status(409).json(errorResponse('Email already registered', 409));
    }
    const user = await User.create({
      name: name.trim(),
      email: normalizedEmail,
      password,
      phone: phone?.trim(),
      role: 'student',
    });

    const rollNumber = `TAC-${Date.now().toString(36).toUpperCase()}`;
    await Student.create({
      user: user._id,
      rollNumber,
      className: 'Class XI',
      stream: 'Science',
    });

    const token = generateToken(user._id);
    res.cookie('token', token, {
      httpOnly: true,
      secure: config.nodeEnv === 'production',
      sameSite: 'lax',
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });
    res.status(201).json(successResponse({ user, token }, 'Account created successfully', 201));
  } catch (error) {
    res.status(500).json(errorResponse(error.message));
  }
});

router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json(errorResponse('Email and password are required', 400));
    }
    const user = await User.findOne({ email: email.toLowerCase().trim() }).select('+password');
    if (!user) {
      return res.status(401).json(errorResponse('Invalid email or password', 401));
    }
    const isPasswordValid = await user.comparePassword(password);
    if (!isPasswordValid) {
      return res.status(401).json(errorResponse('Invalid email or password', 401));
    }
    if (!user.isActive) {
      return res.status(403).json(errorResponse('Account is deactivated. Contact support.', 403));
    }
    const token = generateToken(user._id);
    res.cookie('token', token, {
      httpOnly: true,
      secure: config.nodeEnv === 'production',
      sameSite: 'lax',
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });
    res.json(successResponse({ user, token }, 'Login successful'));
  } catch (error) {
    res.status(500).json(errorResponse(error.message));
  }
});

router.post('/logout', (req, res) => {
  res.clearCookie('token');
  res.json(successResponse(null, 'Logged out successfully'));
});

router.get('/me', authenticate, async (req, res) => {
  try {
    let student = await Student.findOne({ user: req.user._id })
      .populate('enrolledCourseIds');

    // If student profile doesn't exist, create one
    if (!student && req.user.role === 'student') {
      const rollNumber = `TAC-${Date.now().toString(36).toUpperCase()}`;
      student = await Student.create({
        user: req.user._id,
        rollNumber,
        className: 'Not Assigned',
        stream: 'Not Assigned',
      });
    }

    res.json(successResponse({ user: req.user, student }));
  } catch (error) {
    res.status(500).json(errorResponse(error.message));
  }
});

router.post('/forgot-password', async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) {
      return res.status(400).json(errorResponse('Email is required', 400));
    }
    const user = await User.findOne({ email: email.toLowerCase().trim() });
    // Always return success to prevent email enumeration
    if (!user) {
      return res.json(successResponse(null, 'If the email exists, a reset link has been sent'));
    }
    const resetToken = jwt.sign({ id: user._id }, config.jwtSecret, { expiresIn: '1h' });
    user.resetPasswordToken = resetToken;
    user.resetPasswordExpires = new Date(Date.now() + 3600000);
    await user.save();
    res.json(successResponse(null, 'If the email exists, a reset link has been sent'));
  } catch (error) {
    res.status(500).json(errorResponse(error.message));
  }
});

router.post('/reset-password', async (req, res) => {
  try {
    const { token, password } = req.body;
    if (!token || !password) {
      return res.status(400).json(errorResponse('Token and password are required', 400));
    }
    if (password.length < 6) {
      return res.status(400).json(errorResponse('Password must be at least 6 characters', 400));
    }
    const decoded = jwt.verify(token, config.jwtSecret);
    const user = await User.findById(decoded.id);
    if (!user) {
      return res.status(400).json(errorResponse('Invalid or expired reset token', 400));
    }
    user.password = password;
    user.resetPasswordToken = undefined;
    user.resetPasswordExpires = undefined;
    await user.save();
    res.json(successResponse(null, 'Password reset successfully'));
  } catch (error) {
    if (error.name === 'TokenExpiredError') {
      return res.status(400).json(errorResponse('Reset token has expired. Please request a new one.', 400));
    }
    res.status(400).json(errorResponse('Invalid or expired reset token', 400));
  }
});

export default router;
