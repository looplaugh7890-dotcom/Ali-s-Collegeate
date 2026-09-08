import mongoose from 'mongoose';

const resourceSchema = new mongoose.Schema({
  slug: { type: String, required: true, unique: true },
  title: { type: String, required: true },
  description: String,
  type: { type: String, enum: ['PDF', 'Video', 'Document', 'Past Paper', 'Study Material', 'Scholarship', 'Exam Schedule'], required: true },
  category: String,
  access: { type: String, enum: ['free', 'login', 'enrolled'], default: 'free' },
  fileUrl: String,
  meta: String,
  isPublished: { type: Boolean, default: true },
}, { timestamps: true });

resourceSchema.index({ type: 1 });
resourceSchema.index({ access: 1 });

export const Resource = mongoose.model('Resource', resourceSchema);
