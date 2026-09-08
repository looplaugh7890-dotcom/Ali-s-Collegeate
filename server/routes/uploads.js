import { Router } from 'express';
import { upload, cloudinary, isCloudinaryConfigured } from '../middleware/upload.js';
import { authenticate } from '../middleware/auth.js';
import { successResponse, errorResponse } from '../utils/helpers.js';

const router = Router();

function fileToResponse(req, file) {
  if (isCloudinaryConfigured) {
    return {
      url: file.path,
      filename: file.filename || file.public_id,
      originalName: file.originalname,
      size: file.size,
      mimetype: file.mimetype,
    };
  }
  return {
    url: `/uploads/${req.uploadFolder || 'general'}/${file.filename}`,
    filename: file.filename,
    originalName: file.originalname,
    size: file.size,
    mimetype: file.mimetype,
  };
}

router.post('/', authenticate, upload.single('file'), (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json(errorResponse('No file uploaded', 400));
    }
    res.json(successResponse(fileToResponse(req, req.file), 'File uploaded'));
  } catch (error) {
    res.status(500).json(errorResponse(error.message));
  }
});

router.post('/multiple', authenticate, upload.array('files', 10), (req, res) => {
  try {
    if (!req.files || req.files.length === 0) {
      return res.status(400).json(errorResponse('No files uploaded', 400));
    }
    const files = req.files.map((f) => fileToResponse(req, f));
    res.json(successResponse(files, 'Files uploaded'));
  } catch (error) {
    res.status(500).json(errorResponse(error.message));
  }
});

router.delete('/:filename', authenticate, async (req, res) => {
  try {
    if (isCloudinaryConfigured) {
      await cloudinary.uploader.destroy(req.params.filename);
    }
    res.json(successResponse(null, 'File deleted'));
  } catch (error) {
    res.status(500).json(errorResponse(error.message));
  }
});

export default router;
