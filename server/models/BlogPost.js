import mongoose from 'mongoose';

const blogPostSchema = new mongoose.Schema({
  slug: { type: String, required: true, unique: true },
  title: { type: String, required: true },
  excerpt: String,
  content: String,
  category: String,
  author: String,
  date: String,
  readTime: String,
  imageUrl: String,
  featured: { type: Boolean, default: false },
  isPublished: { type: Boolean, default: true },
}, { timestamps: true });

blogPostSchema.index({ isPublished: 1 });

export const BlogPost = mongoose.model('BlogPost', blogPostSchema);
