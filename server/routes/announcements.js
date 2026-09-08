import { Router } from 'express';
import { Announcement } from '../models/Announcement.js';
import { optionalAuth, authenticate, authorize } from '../middleware/auth.js';
import { successResponse, errorResponse, parsePagination, paginatedResponse } from '../utils/helpers.js';

const router = Router();

router.get('/', optionalAuth, async (req, res) => {
  try {
    const { category } = req.query;
    const filter = { isPublished: true };
    if (category) filter.category = category;
    const { page, limit, skip } = parsePagination(req.query);
    const [data, total] = await Promise.all([
      Announcement.find(filter).sort({ createdAt: -1 }).skip(skip).limit(limit),
      Announcement.countDocuments(filter),
    ]);
    res.json(paginatedResponse(data, total, page, limit));
  } catch (error) {
    res.status(500).json(errorResponse(error.message));
  }
});

router.post('/', authenticate, authorize('admin'), async (req, res) => {
  try {
    const announcement = await Announcement.create(req.body);
    res.status(201).json(successResponse(announcement, 'Announcement created', 201));
  } catch (error) {
    res.status(400).json(errorResponse(error.message, 400));
  }
});

router.put('/:id', authenticate, authorize('admin'), async (req, res) => {
  try {
    const announcement = await Announcement.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });
    if (!announcement) return res.status(404).json(errorResponse('Announcement not found', 404));
    res.json(successResponse(announcement, 'Announcement updated'));
  } catch (error) {
    res.status(400).json(errorResponse(error.message, 400));
  }
});

router.delete('/:id', authenticate, authorize('admin'), async (req, res) => {
  try {
    const announcement = await Announcement.findByIdAndDelete(req.params.id);
    if (!announcement) return res.status(404).json(errorResponse('Announcement not found', 404));
    res.json(successResponse(null, 'Announcement deleted'));
  } catch (error) {
    res.status(500).json(errorResponse(error.message));
  }
});

export default router;
