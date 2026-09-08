import mongoose from 'mongoose';

const questionSchema = new mongoose.Schema({
  question: { type: String, required: true },
  options: [{ type: String, required: true }],
  correctAnswer: { type: Number, required: true },
  marks: { type: Number, default: 1 },
});

const quizSchema = new mongoose.Schema({
  title: { type: String, required: true },
  course: { type: mongoose.Schema.Types.ObjectId, ref: 'Course', required: true },
  durationMinutes: { type: Number, required: true },
  scheduledFor: Date,
  questions: [questionSchema],
  isPublished: { type: Boolean, default: true },
}, { timestamps: true });

const quizAttemptSchema = new mongoose.Schema({
  quiz: { type: mongoose.Schema.Types.ObjectId, ref: 'Quiz', required: true },
  student: { type: mongoose.Schema.Types.ObjectId, ref: 'Student', required: true },
  answers: [{
    questionIndex: Number,
    selectedAnswer: Number,
    isCorrect: Boolean,
  }],
  score: { type: Number, default: 0 },
  totalMarks: { type: Number, default: 0 },
  percentage: { type: Number, default: 0 },
  startedAt: { type: Date, default: Date.now },
  completedAt: Date,
  status: { type: String, enum: ['in-progress', 'completed', 'expired'], default: 'in-progress' },
}, { timestamps: true });

quizAttemptSchema.index({ quiz: 1, student: 1 });

export const Quiz = mongoose.model('Quiz', quizSchema);
export const QuizAttempt = mongoose.model('QuizAttempt', quizAttemptSchema);
