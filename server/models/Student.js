import mongoose from 'mongoose';

const studentSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  rollNumber: { type: String, required: true, unique: true },
  className: { type: String, required: true },
  stream: { type: String, trim: true },
  section: String,
  guardianName: String,
  guardianPhone: String,
  address: String,
  city: String,
  dateOfBirth: Date,
  gender: { type: String, enum: ['Male', 'Female', 'Other'] },
  cnicBform: String,
  previousSchool: String,
  lastClassPassed: String,
  board: String,
  marksObtained: String,
  passingYear: String,
  boardRollNumber: String,
  enrolledCourseIds: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Course' }],
  admissionDate: { type: Date, default: Date.now },
  paymentStatus: { type: String, enum: ['unpaid', 'partial', 'paid'], default: 'unpaid' },
}, { timestamps: true });

export const Student = mongoose.model('Student', studentSchema);
