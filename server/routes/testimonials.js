import { Router } from 'express';
import { Testimonial } from '../models/Testimonial.js';
import { authenticate, authorize } from '../middleware/auth.js';
import { successResponse, errorResponse, parsePagination, paginatedResponse } from '../utils/helpers.js';

const router = Router();

router.get('/', async (req, res) => {
  try {
    const { page, limit, skip } = parsePagination(req.query);
    const [data, total] = await Promise.all([
      Testimonial.find({ isPublished: true }).sort({ createdAt: -1 }).skip(skip).limit(limit),
      Testimonial.countDocuments({ isPublished: true }),
    ]);
    res.json(paginatedResponse(data, total, page, limit));
  } catch (error) {
    res.status(500).json(errorResponse(error.message));
  }
});

router.post('/', authenticate, authorize('admin'), async (req, res) => {
  try {
    const testimonial = await Testimonial.create(req.body);
    res.status(201).json(successResponse(testimonial, 'Testimonial created', 201));
  } catch (error) {
    res.status(400).json(errorResponse(error.message, 400));
  }
});

router.put('/:id', authenticate, authorize('admin'), async (req, res) => {
  try {
    const testimonial = await Testimonial.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });
    if (!testimonial) return res.status(404).json(errorResponse('Testimonial not found', 404));
    res.json(successResponse(testimonial, 'Testimonial updated'));
  } catch (error) {
    res.status(400).json(errorResponse(error.message, 400));
  }
});

router.delete('/:id', authenticate, authorize('admin'), async (req, res) => {
  try {
    const testimonial = await Testimonial.findByIdAndDelete(req.params.id);
    if (!testimonial) return res.status(404).json(errorResponse('Testimonial not found', 404));
    res.json(successResponse(null, 'Testimonial deleted'));
  } catch (error) {
    res.status(500).json(errorResponse(error.message));
  }
});

export default router;
