import { Router } from 'express';
import { Student } from '../models/Student.js';
import { Course } from '../models/Course.js';
import { Enrollment } from '../models/Enrollment.js';
import { Assignment, Submission } from '../models/Assignment.js';
import { Quiz, QuizAttempt } from '../models/Quiz.js';
import { Resource } from '../models/Resource.js';
import { authenticate } from '../middleware/auth.js';
import { successResponse, errorResponse, parsePagination, paginatedResponse } from '../utils/helpers.js';

const router = Router();
router.use(authenticate);

router.get('/profile', async (req, res) => {
  try {
    const student = await Student.findOne({ user: req.userId })
      .populate('user')
      .populate('enrolledCourseIds');
    if (!student) return res.status(404).json(errorResponse('Student profile not found', 404));
    res.json(successResponse(student));
  } catch (error) {
    res.status(500).json(errorResponse(error.message));
  }
});

router.put('/profile', async (req, res) => {
  try {
    const allowedFields = ['guardianName', 'guardianPhone', 'address', 'city', 'phone'];
    const updates = {};
    for (const field of allowedFields) {
      if (req.body[field] !== undefined) updates[field] = req.body[field];
    }
    const student = await Student.findOneAndUpdate(
      { user: req.userId },
      updates,
      { new: true, runValidators: true }
    ).populate('user');
    if (!student) return res.status(404).json(errorResponse('Student profile not found', 404));
    res.json(successResponse(student, 'Profile updated'));
  } catch (error) {
    res.status(400).json(errorResponse(error.message, 400));
  }
});

router.get('/courses', async (req, res) => {
  try {
    const student = await Student.findOne({ user: req.userId });
    if (!student) return res.status(404).json(errorResponse('Student not found', 404));
    const enrollments = await Enrollment.find({ student: student._id })
      .populate('course')
      .sort({ enrolledAt: -1 });
    res.json(successResponse(enrollments));
  } catch (error) {
    res.status(500).json(errorResponse(error.message));
  }
});

router.get('/courses/all', async (req, res) => {
  try {
    const student = await Student.findOne({ user: req.userId });
    if (!student) return res.status(404).json(errorResponse('Student not found', 404));
    const courses = await Course.find({ isPublished: true }).sort({ createdAt: -1 });
    const enrollments = await Enrollment.find({ student: student._id });
    const enrolledCourseIds = enrollments.map((e) => e.course.toString());
    const result = courses.map((c) => {
      const enrollment = enrollments.find((e) => e.course.toString() === c._id.toString());
      const totalLessons = c.modules.reduce((sum, m) => sum + m.lessons.length, 0);
      return {
        _id: c._id,
        slug: c.slug,
        title: c.title,
        category: c.category,
        instructor: c.instructor,
        duration: c.duration,
        level: c.level,
        imageUrl: c.imageUrl,
        lessons: totalLessons,
        chapters: c.modules.length,
        enrolled: enrolledCourseIds.includes(c._id.toString()),
        enrollmentId: enrollment?._id || null,
        progress: enrollment?.progress || 0,
      };
    });
    res.json(successResponse(result));
  } catch (error) {
    res.status(500).json(errorResponse(error.message));
  }
});

router.post('/enroll/:courseId', async (req, res) => {
  try {
    const student = await Student.findOne({ user: req.userId });
    if (!student) return res.status(404).json(errorResponse('Student not found', 404));
    const course = await Course.findById(req.params.courseId);
    if (!course) return res.status(404).json(errorResponse('Course not found', 404));
    const existing = await Enrollment.findOne({ student: student._id, course: course._id });
    if (existing) return res.json(successResponse(existing, 'Already enrolled'));
    const enrollment = await Enrollment.create({ student: student._id, course: course._id });
    res.status(201).json(successResponse(enrollment, 'Enrolled successfully', 201));
  } catch (error) {
    res.status(400).json(errorResponse(error.message, 400));
  }
});

router.get('/assignments', async (req, res) => {
  try {
    const student = await Student.findOne({ user: req.userId });
    if (!student) return res.status(404).json(errorResponse('Student not found', 404));
    const enrollments = await Enrollment.find({ student: student._id });
    const courseIds = enrollments.map((e) => e.course);
    const assignments = await Assignment.find({ course: { $in: courseIds } })
      .populate('course', 'title slug')
      .sort({ dueDate: -1 });
    const submissions = await Submission.find({ student: student._id });
    const result = assignments.map((a) => {
      const sub = submissions.find((s) => s.assignment.toString() === a._id.toString());
      return {
        id: a._id,
        title: a.title,
        courseSlug: a.course?.slug,
        courseTitle: a.course?.title,
        dueDate: a.dueDate,
        status: sub ? sub.status : 'pending',
        marks: sub ? `${sub.marks} / ${a.totalMarks}` : undefined,
        instructions: a.instructions,
      };
    });
    res.json(successResponse(result));
  } catch (error) {
    res.status(500).json(errorResponse(error.message));
  }
});

router.post('/assignments/:id/submit', async (req, res) => {
  try {
    const student = await Student.findOne({ user: req.userId });
    if (!student) return res.status(404).json(errorResponse('Student not found', 404));
    const submission = await Submission.findOneAndUpdate(
      { assignment: req.params.id, student: student._id },
      { fileUrl: req.body.fileUrl, notes: req.body.notes, status: 'submitted', submittedAt: new Date() },
      { new: true, upsert: true }
    );
    res.json(successResponse(submission, 'Assignment submitted'));
  } catch (error) {
    res.status(400).json(errorResponse(error.message, 400));
  }
});

router.get('/quizzes', async (req, res) => {
  try {
    const student = await Student.findOne({ user: req.userId });
    if (!student) return res.status(404).json(errorResponse('Student not found', 404));
    const enrollments = await Enrollment.find({ student: student._id });
    const courseIds = enrollments.map((e) => e.course);
    const quizzes = await Quiz.find({ course: { $in: courseIds } })
      .populate('course', 'title slug')
      .sort({ scheduledFor: -1 });
    const attempts = await QuizAttempt.find({ student: student._id });
    const result = quizzes.map((q) => {
      const attempt = attempts.find((a) => a.quiz.toString() === q._id.toString());
      const now = new Date();
      let status = 'upcoming';
      if (attempt) status = 'completed';
      else if (q.scheduledFor && q.scheduledFor <= now) status = 'available';
      return {
        id: q._id,
        title: q.title,
        courseSlug: q.course?.slug,
        courseTitle: q.course?.title,
        questions: q.questions?.length || 0,
        durationMinutes: q.durationMinutes,
        status,
        scheduledFor: q.scheduledFor,
        score: attempt?.percentage,
      };
    });
    res.json(successResponse(result));
  } catch (error) {
    res.status(500).json(errorResponse(error.message));
  }
});

router.get('/results', async (req, res) => {
  try {
    const student = await Student.findOne({ user: req.userId });
    if (!student) return res.status(404).json(errorResponse('Student not found', 404));
    const attempts = await QuizAttempt.find({ student: student._id, status: 'completed' })
      .populate({ path: 'quiz', populate: { path: 'course', select: 'title' } })
      .sort({ completedAt: -1 });
    const gradedSubmissions = await Submission.find({ student: student._id, status: 'graded' })
      .populate({ path: 'assignment', populate: { path: 'course', select: 'title' } })
      .sort({ gradedAt: -1 });
    const results = [];
    for (const a of attempts) {
      results.push({
        id: a._id,
        assessment: a.quiz?.title || 'Quiz',
        courseTitle: a.quiz?.course?.title || '',
        date: a.completedAt?.toLocaleDateString() || '',
        obtained: a.score,
        total: a.totalMarks,
        grade: getGrade(a.percentage),
      });
    }
    for (const s of gradedSubmissions) {
      results.push({
        id: s._id,
        assessment: s.assignment?.title || 'Assignment',
        courseTitle: s.assignment?.course?.title || '',
        date: s.gradedAt?.toLocaleDateString() || '',
        obtained: s.marks,
        total: s.assignment?.totalMarks || 20,
        grade: getGrade((s.marks / (s.assignment?.totalMarks || 20)) * 100),
      });
    }
    results.sort((a, b) => new Date(b.date) - new Date(a.date));
    res.json(successResponse(results));
  } catch (error) {
    res.status(500).json(errorResponse(error.message));
  }
});

router.get('/resources', async (req, res) => {
  try {
    const { page, limit, skip } = parsePagination(req.query);
    const filter = { isPublished: true };
    const [data, total] = await Promise.all([
      Resource.find(filter).sort({ createdAt: -1 }).skip(skip).limit(limit),
      Resource.countDocuments(filter),
    ]);
    res.json(paginatedResponse(data, total, page, limit));
  } catch (error) {
    res.status(500).json(errorResponse(error.message));
  }
});

function getGrade(percentage) {
  if (percentage >= 90) return 'A+';
  if (percentage >= 80) return 'A';
  if (percentage >= 70) return 'B+';
  if (percentage >= 60) return 'B';
  if (percentage >= 50) return 'C';
  if (percentage >= 40) return 'D';
  return 'F';
}

export default router;
