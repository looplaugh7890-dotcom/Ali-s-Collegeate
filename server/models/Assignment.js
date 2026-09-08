import mongoose from 'mongoose';

const assignmentSchema = new mongoose.Schema({
  title: { type: String, required: true },
  course: { type: mongoose.Schema.Types.ObjectId, ref: 'Course', required: true },
  instructions: String,
  dueDate: Date,
  totalMarks: { type: Number, default: 20 },
  isPublished: { type: Boolean, default: true },
}, { timestamps: true });

const submissionSchema = new mongoose.Schema({
  assignment: { type: mongoose.Schema.Types.ObjectId, ref: 'Assignment', required: true },
  student: { type: mongoose.Schema.Types.ObjectId, ref: 'Student', required: true },
  fileUrl: String,
  notes: String,
  status: { type: String, enum: ['pending', 'submitted', 'graded', 'overdue'], default: 'submitted' },
  marks: Number,
  feedback: String,
  submittedAt: { type: Date, default: Date.now },
  gradedAt: Date,
}, { timestamps: true });

submissionSchema.index({ assignment: 1, student: 1 }, { unique: true });

export const Assignment = mongoose.model('Assignment', assignmentSchema);
export const Submission = mongoose.model('Submission', submissionSchema);
