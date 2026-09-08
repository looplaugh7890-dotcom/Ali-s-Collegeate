import mongoose from 'mongoose';

const lessonSchema = new mongoose.Schema({
  title: { type: String, required: true },
  type: { type: String, enum: ['Video', 'PDF', 'DOCX', 'TXT', 'Quiz', 'Assignment'], required: true },
  duration: String,
  videoUrl: String,
  pdfUrl: String,
  fileUrl: String,
  content: String,
  order: { type: Number, default: 0 },
  isPublished: { type: Boolean, default: true },
});

const moduleSchema = new mongoose.Schema({
  title: { type: String, required: true },
  summary: String,
  order: { type: Number, default: 0 },
  lessons: [lessonSchema],
}, { timestamps: true });

const courseSchema = new mongoose.Schema({
  slug: { type: String, required: true, unique: true },
  title: { type: String, required: true },
  program: { type: String, required: true },
  category: { type: String, required: true },
  instructor: { type: String, required: true },
  duration: { type: String, required: true },
  level: { type: String, required: true },
  lessons: { type: Number, default: 0 },
  description: String,
  imageUrl: String,
  fee: { type: Number, default: 0 },
  isPublished: { type: Boolean, default: true },
  modules: [moduleSchema],
}, { timestamps: true });

courseSchema.index({ category: 1 });
courseSchema.index({ isPublished: 1 });

export const Course = mongoose.model('Course', courseSchema);
export const Module = mongoose.model('Module', moduleSchema);
