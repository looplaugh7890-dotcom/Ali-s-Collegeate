import { connectDB } from './db.js';
import { User } from './models/User.js';
import { SiteSettings } from './models/SiteSettings.js';

const seedData = async () => {
  await connectDB();

  // Only create admin user if it doesn't exist
  const adminExists = await User.findOne({ email: 'admin@thealiscollegiate.com' });
  if (!adminExists) {
    await User.create({
      name: 'Admin',
      email: 'admin@thealiscollegiate.com',
      password: 'admin123',
      role: 'admin',
      phone: '0300-1234567',
    });
    console.log('Admin user created: admin@thealiscollegiate.com / admin123');
  }

  // Only create essential site settings if they don't exist
  const settingsCount = await SiteSettings.countDocuments();
  if (settingsCount === 0) {
    await SiteSettings.insertMany([
      { key: 'siteName', value: "The Ali's Collegiate", category: 'general' },
      { key: 'tagline', value: 'Passion for Victory', category: 'general' },
      { key: 'phone', value: '0300-1234567', category: 'contact' },
      { key: 'email', value: 'info@thealiscollegiate.com', category: 'contact' },
      { key: 'address', value: 'New Karachi, Karachi, Pakistan', category: 'contact' },
      { key: 'admissionFee', value: 2000, category: 'payment' },
      { key: 'monthlyFee', value: 4500, category: 'payment' },
    ]);
    console.log('Site settings created');
  }

  console.log('Seed complete! All courses, resources, announcements, blog posts, and testimonials should be added through the admin panel.');
  process.exit(0);
};

seedData().catch(err => {
  console.error('Seed error:', err);
  process.exit(1);
});
