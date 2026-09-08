import mongoose from 'mongoose';

const testimonialSchema = new mongoose.Schema({
  name: { type: String, required: true },
  program: String,
  quote: { type: String, required: true },
  achievement: String,
  initials: String,
  isPublished: { type: Boolean, default: true },
}, { timestamps: true });

export const Testimonial = mongoose.model('Testimonial', testimonialSchema);
