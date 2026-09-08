import { Router } from 'express';
import { Resource } from '../models/Resource.js';
import { optionalAuth, authenticate, authorize } from '../middleware/auth.js';
import { successResponse, errorResponse, parsePagination, paginatedResponse, safeSearchRegex } from '../utils/helpers.js';

const router = Router();

router.get('/', optionalAuth, async (req, res) => {
  try {
    const { type, access, search } = req.query;
    const filter = { isPublished: true };
    if (type) filter.type = type;
    if (access) filter.access = access;
    const regex = safeSearchRegex(search);
    if (regex) filter.title = regex;
    const { page, limit, skip } = parsePagination(req.query);
    const [data, total] = await Promise.all([
      Resource.find(filter).sort({ createdAt: -1 }).skip(skip).limit(limit),
      Resource.countDocuments(filter),
    ]);
    res.json(paginatedResponse(data, total, page, limit));
  } catch (error) {
    res.status(500).json(errorResponse(error.message));
  }
});

router.get('/:slug', optionalAuth, async (req, res) => {
  try {
    const resource = await Resource.findOne({ slug: req.params.slug, isPublished: true });
    if (!resource) return res.status(404).json(errorResponse('Resource not found', 404));
    res.json(successResponse(resource));
  } catch (error) {
    res.status(500).json(errorResponse(error.message));
  }
});

router.post('/', authenticate, authorize('admin'), async (req, res) => {
  try {
    const resource = await Resource.create(req.body);
    res.status(201).json(successResponse(resource, 'Resource created', 201));
  } catch (error) {
    res.status(400).json(errorResponse(error.message, 400));
  }
});

router.put('/:id', authenticate, authorize('admin'), async (req, res) => {
  try {
    const resource = await Resource.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });
    if (!resource) return res.status(404).json(errorResponse('Resource not found', 404));
    res.json(successResponse(resource, 'Resource updated'));
  } catch (error) {
    res.status(400).json(errorResponse(error.message, 400));
  }
});

router.delete('/:id', authenticate, authorize('admin'), async (req, res) => {
  try {
    const resource = await Resource.findByIdAndDelete(req.params.id);
    if (!resource) return res.status(404).json(errorResponse('Resource not found', 404));
    res.json(successResponse(null, 'Resource deleted'));
  } catch (error) {
    res.status(500).json(errorResponse(error.message));
  }
});

export default router;
