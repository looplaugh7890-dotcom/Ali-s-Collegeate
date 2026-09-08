import { Router } from 'express';
import { Course } from '../models/Course.js';
import { optionalAuth, authenticate, authorize } from '../middleware/auth.js';
import { successResponse, errorResponse, parsePagination, paginatedResponse, safeSearchRegex } from '../utils/helpers.js';

const router = Router();

// --- Admin routes (must be before /:slug to avoid route conflict) ---

router.get('/admin/:id', authenticate, authorize('admin'), async (req, res) => {
  try {
    const course = await Course.findById(req.params.id);
    if (!course) return res.status(404).json(errorResponse('Course not found', 404));
    res.json(successResponse(course));
  } catch (error) {
    res.status(500).json(errorResponse(error.message));
  }
});

router.get('/admin', authenticate, authorize('admin'), async (req, res) => {
  try {
    const { search } = req.query;
    const filter = {};
    const regex = safeSearchRegex(search);
    if (regex) filter.title = regex;
    const { page, limit, skip } = parsePagination(req.query);
    const [data, total] = await Promise.all([
      Course.find(filter).sort({ createdAt: -1 }).skip(skip).limit(limit),
      Course.countDocuments(filter),
    ]);
    res.json(paginatedResponse(data, total, page, limit));
  } catch (error) {
    res.status(500).json(errorResponse(error.message));
  }
});

// --- Public routes ---

router.get('/', optionalAuth, async (req, res) => {
  try {
    const { category, search } = req.query;
    const filter = { isPublished: true };
    if (category) filter.category = category;
    const regex = safeSearchRegex(search);
    if (regex) filter.title = regex;
    const { page, limit, skip } = parsePagination(req.query);
    const [data, total] = await Promise.all([
      Course.find(filter).sort({ createdAt: -1 }).skip(skip).limit(limit),
      Course.countDocuments(filter),
    ]);
    res.json(paginatedResponse(data, total, page, limit));
  } catch (error) {
    res.status(500).json(errorResponse(error.message));
  }
});

router.get('/:slug', optionalAuth, async (req, res) => {
  try {
    const course = await Course.findOne({ slug: req.params.slug, isPublished: true });
    if (!course) return res.status(404).json(errorResponse('Course not found', 404));
    res.json(successResponse(course));
  } catch (error) {
    res.status(500).json(errorResponse(error.message));
  }
});

router.get('/:slug/modules', optionalAuth, async (req, res) => {
  try {
    const course = await Course.findOne({ slug: req.params.slug, isPublished: true });
    if (!course) return res.status(404).json(errorResponse('Course not found', 404));
    res.json(successResponse(course.modules || []));
  } catch (error) {
    res.status(500).json(errorResponse(error.message));
  }
});

// --- Admin mutation routes ---

router.post('/', authenticate, authorize('admin'), async (req, res) => {
  try {
    const course = await Course.create(req.body);
    res.status(201).json(successResponse(course, 'Course created', 201));
  } catch (error) {
    res.status(400).json(errorResponse(error.message, 400));
  }
});

router.put('/:id', authenticate, authorize('admin'), async (req, res) => {
  try {
    const course = await Course.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });
    if (!course) return res.status(404).json(errorResponse('Course not found', 404));
    res.json(successResponse(course, 'Course updated'));
  } catch (error) {
    res.status(400).json(errorResponse(error.message, 400));
  }
});

router.delete('/:id', authenticate, authorize('admin'), async (req, res) => {
  try {
    const course = await Course.findByIdAndDelete(req.params.id);
    if (!course) return res.status(404).json(errorResponse('Course not found', 404));
    res.json(successResponse(null, 'Course deleted'));
  } catch (error) {
    res.status(500).json(errorResponse(error.message));
  }
});

router.post('/:id/modules', authenticate, authorize('admin'), async (req, res) => {
  try {
    const course = await Course.findById(req.params.id);
    if (!course) return res.status(404).json(errorResponse('Course not found', 404));
    course.modules.push(req.body);
    course.lessons = course.modules.reduce((sum, m) => sum + m.lessons.length, 0);
    await course.save();
    res.status(201).json(successResponse(course, 'Module added', 201));
  } catch (error) {
    res.status(400).json(errorResponse(error.message, 400));
  }
});

router.put('/:courseId/modules/:moduleId', authenticate, authorize('admin'), async (req, res) => {
  try {
    const course = await Course.findById(req.params.courseId);
    if (!course) return res.status(404).json(errorResponse('Course not found', 404));
    const mod = course.modules.id(req.params.moduleId);
    if (!mod) return res.status(404).json(errorResponse('Module not found', 404));
    Object.assign(mod, req.body);
    await course.save();
    res.json(successResponse(course, 'Module updated'));
  } catch (error) {
    res.status(400).json(errorResponse(error.message, 400));
  }
});

router.delete('/:courseId/modules/:moduleId', authenticate, authorize('admin'), async (req, res) => {
  try {
    const course = await Course.findById(req.params.courseId);
    if (!course) return res.status(404).json(errorResponse('Course not found', 404));
    course.modules.pull(req.params.moduleId);
    course.lessons = course.modules.reduce((sum, m) => sum + m.lessons.length, 0);
    await course.save();
    res.json(successResponse(null, 'Module deleted'));
  } catch (error) {
    res.status(500).json(errorResponse(error.message));
  }
});

// --- Lesson routes (within modules) ---

router.post('/:courseId/modules/:moduleId/lessons', authenticate, authorize('admin'), async (req, res) => {
  try {
    const course = await Course.findById(req.params.courseId);
    if (!course) return res.status(404).json(errorResponse('Course not found', 404));
    const mod = course.modules.id(req.params.moduleId);
    if (!mod) return res.status(404).json(errorResponse('Module not found', 404));
    mod.lessons.push({ ...req.body, isPublished: true });
    course.lessons = course.modules.reduce((sum, m) => sum + m.lessons.length, 0);
    await course.save();
    res.status(201).json(successResponse(course, 'Lesson added', 201));
  } catch (error) {
    res.status(400).json(errorResponse(error.message, 400));
  }
});

router.put('/:courseId/modules/:moduleId/lessons/:lessonId', authenticate, authorize('admin'), async (req, res) => {
  try {
    const course = await Course.findById(req.params.courseId);
    if (!course) return res.status(404).json(errorResponse('Course not found', 404));
    const mod = course.modules.id(req.params.moduleId);
    if (!mod) return res.status(404).json(errorResponse('Module not found', 404));
    const lesson = mod.lessons.id(req.params.lessonId);
    if (!lesson) return res.status(404).json(errorResponse('Lesson not found', 404));
    Object.assign(lesson, req.body);
    await course.save();
    res.json(successResponse(course, 'Lesson updated'));
  } catch (error) {
    res.status(400).json(errorResponse(error.message, 400));
  }
});

router.delete('/:courseId/modules/:moduleId/lessons/:lessonId', authenticate, authorize('admin'), async (req, res) => {
  try {
    const course = await Course.findById(req.params.courseId);
    if (!course) return res.status(404).json(errorResponse('Course not found', 404));
    const mod = course.modules.id(req.params.moduleId);
    if (!mod) return res.status(404).json(errorResponse('Module not found', 404));
    mod.lessons.pull(req.params.lessonId);
    course.lessons = course.modules.reduce((sum, m) => sum + m.lessons.length, 0);
    await course.save();
    res.json(successResponse(null, 'Lesson deleted'));
  } catch (error) {
    res.status(500).json(errorResponse(error.message));
  }
});

export default router;
