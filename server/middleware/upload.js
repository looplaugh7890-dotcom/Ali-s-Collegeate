import multer from 'multer';
import { CloudinaryStorage } from 'multer-storage-cloudinary';
import { v2 as cloudinary } from 'cloudinary';
import { join, extname } from 'path';
import { existsSync, mkdirSync } from 'fs';
import config from '../config.js';

const isCloudinaryConfigured =
  config.cloudinary.cloudName && config.cloudinary.apiKey && config.cloudinary.apiSecret;

if (isCloudinaryConfigured) {
  cloudinary.config({
    cloud_name: config.cloudinary.cloudName,
    api_key: config.cloudinary.apiKey,
    api_secret: config.cloudinary.apiSecret,
  });
}

const allowedImageTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
const allowedDocTypes = [
  'application/pdf',
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  'application/vnd.ms-excel',
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  'text/plain',
];
const allowedVideoTypes = ['video/mp4', 'video/webm', 'video/quicktime'];
const allowedTypes = [...allowedImageTypes, ...allowedDocTypes, ...allowedVideoTypes];

function createCloudinaryStorage() {
  return new CloudinaryStorage({
    cloudinary,
    params: (req, file) => ({
      folder: `thealiscollegiate/${req.uploadFolder || 'general'}`,
      resource_type: allowedVideoTypes.includes(file.mimetype) ? 'video' : 'auto',
      format: allowedImageTypes.includes(file.mimetype) ? undefined : extname(file.originalname).replace('.', '') || undefined,
      public_id: `${Date.now()}-${Math.round(Math.random() * 1e9)}`,
    }),
  });
}

function createLocalStorage() {
  return multer.diskStorage({
    destination: (req, file, cb) => {
      const uploadPath = join(config.uploadDir || './server/uploads', req.uploadFolder || 'general');
      if (!existsSync(uploadPath)) {
        mkdirSync(uploadPath, { recursive: true });
      }
      cb(null, uploadPath);
    },
    filename: (req, file, cb) => {
      const uniqueSuffix = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
      cb(null, `${uniqueSuffix}${extname(file.originalname)}`);
    },
  });
}

const storage = isCloudinaryConfigured ? createCloudinaryStorage() : createLocalStorage();

const fileFilter = (req, file, cb) => {
  if (allowedTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error(`File type ${file.mimetype} is not allowed`), false);
  }
};

export const upload = multer({
  storage,
  fileFilter,
  limits: { fileSize: config.maxFileSize || 100 * 1024 * 1024 },
});

export const uploadDocument = (folder) => (req, res, next) => {
  req.uploadFolder = folder || 'documents';
  next();
};

export { cloudinary, isCloudinaryConfigured };
