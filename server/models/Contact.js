import mongoose from 'mongoose';

const contactSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true },
  phone: String,
  subject: String,
  message: { type: String, required: true },
  type: { type: String, enum: ['contact', 'enquiry', 'admission-enquiry'], default: 'contact' },
  isRead: { type: Boolean, default: false },
  repliedAt: Date,
}, { timestamps: true });

contactSchema.index({ isRead: 1 });

export const Contact = mongoose.model('Contact', contactSchema);
