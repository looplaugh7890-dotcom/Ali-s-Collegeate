import { Router } from 'express';
import { BlogPost } from '../models/BlogPost.js';
import { optionalAuth, authenticate, authorize } from '../middleware/auth.js';
import { successResponse, errorResponse, parsePagination, paginatedResponse, safeSearchRegex } from '../utils/helpers.js';

const router = Router();

router.get('/', optionalAuth, async (req, res) => {
  try {
    const { category, search } = req.query;
    const filter = { isPublished: true };
    if (category) filter.category = category;
    const regex = safeSearchRegex(search);
    if (regex) {
      filter.$or = [{ title: regex }, { excerpt: regex }, { author: regex }];
    }
    const { page, limit, skip } = parsePagination(req.query);
    const [data, total] = await Promise.all([
      BlogPost.find(filter).sort({ createdAt: -1 }).skip(skip).limit(limit),
      BlogPost.countDocuments(filter),
    ]);
    res.json(paginatedResponse(data, total, page, limit));
  } catch (error) {
    res.status(500).json(errorResponse(error.message));
  }
});

router.get('/:slug', optionalAuth, async (req, res) => {
  try {
    const post = await BlogPost.findOne({ slug: req.params.slug, isPublished: true });
    if (!post) return res.status(404).json(errorResponse('Post not found', 404));
    res.json(successResponse(post));
  } catch (error) {
    res.status(500).json(errorResponse(error.message));
  }
});

router.post('/', authenticate, authorize('admin'), async (req, res) => {
  try {
    const post = await BlogPost.create(req.body);
    res.status(201).json(successResponse(post, 'Post created', 201));
  } catch (error) {
    res.status(400).json(errorResponse(error.message, 400));
  }
});

router.put('/:id', authenticate, authorize('admin'), async (req, res) => {
  try {
    const post = await BlogPost.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });
    if (!post) return res.status(404).json(errorResponse('Post not found', 404));
    res.json(successResponse(post, 'Post updated'));
  } catch (error) {
    res.status(400).json(errorResponse(error.message, 400));
  }
});

router.delete('/:id', authenticate, authorize('admin'), async (req, res) => {
  try {
    const post = await BlogPost.findByIdAndDelete(req.params.id);
    if (!post) return res.status(404).json(errorResponse('Post not found', 404));
    res.json(successResponse(null, 'Post deleted'));
  } catch (error) {
    res.status(500).json(errorResponse(error.message));
  }
});

export default router;
