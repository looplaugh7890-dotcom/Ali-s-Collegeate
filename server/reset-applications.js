import { connectDB } from './db.js';
import { Application } from './models/Application.js';
import { User } from './models/User.js';
import { Student } from './models/Student.js';
import { Enrollment } from './models/Enrollment.js';

const reset = async () => {
  await connectDB();

  const apps = await Application.deleteMany({});
  console.log(`Deleted ${apps.deletedCount} applications`);

  const users = await User.deleteMany({ role: 'student' });
  console.log(`Deleted ${users.deletedCount} student users`);

  const students = await Student.deleteMany({});
  console.log(`Deleted ${students.deletedCount} student profiles`);

  const enrollments = await Enrollment.deleteMany({});
  console.log(`Deleted ${enrollments.deletedCount} enrollments`);

  console.log('Done! All application records cleared. You can now reuse those emails.');
  process.exit(0);
};

reset().catch(err => {
  console.error('Reset error:', err);
  process.exit(1);
});
