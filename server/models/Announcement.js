import mongoose from 'mongoose';

const announcementSchema = new mongoose.Schema({
  category: { type: String, enum: ['Announcement', 'Event', 'Academic Update', 'Reminder'], required: true },
  title: { type: String, required: true },
  description: String,
  date: String,
  isPublished: { type: Boolean, default: true },
}, { timestamps: true });

export const Announcement = mongoose.model('Announcement', announcementSchema);
