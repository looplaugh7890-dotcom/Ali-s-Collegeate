import mongoose from 'mongoose';

const siteSettingsSchema = new mongoose.Schema({
  key: { type: String, required: true, unique: true },
  value: { type: mongoose.Schema.Types.Mixed },
  category: { type: String, default: 'general' },
}, { timestamps: true });

export const SiteSettings = mongoose.model('SiteSettings', siteSettingsSchema);
