import mongoose from 'mongoose';

const applicationSchema = new mongoose.Schema({
  applicationNumber: { type: String, required: true, unique: true },
  firstName: { type: String, required: true, trim: true },
  lastName: { type: String, required: true, trim: true },
  fatherName: { type: String, trim: true },
  dateOfBirth: Date,
  gender: { type: String, enum: ['Male', 'Female', 'Other'] },
  cnicBform: { type: String, trim: true },
  phone: { type: String, trim: true },
  guardianPhone: { type: String, trim: true },
  email: { type: String, lowercase: true, trim: true },
  address: { type: String, trim: true },
  city: { type: String, trim: true },
  previousSchool: { type: String, trim: true },
  lastClassPassed: { type: String, trim: true },
  board: { type: String, trim: true },
  marksObtained: { type: String, trim: true },
  passingYear: { type: String, trim: true },
  boardRollNumber: { type: String, trim: true },
  program: { type: String, required: true },
  stream: String,
  batch: String,
  notes: String,
  documents: [{
    name: String,
    url: String,
    uploadedAt: { type: Date, default: Date.now },
  }],
  paymentMethod: String,
  paymentReference: String,
  paymentAmount: { type: Number, default: 0 },
  paymentStatus: { type: String, enum: ['unpaid', 'pending', 'paid', 'failed'], default: 'unpaid' },
  status: {
    type: String,
    enum: ['draft', 'submitted', 'under-review', 'accepted', 'rejected'],
    default: 'submitted',
  },
  stripePaymentIntentId: String,
  reviewedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  reviewedAt: Date,
  adminNotes: String,
}, { timestamps: true });

applicationSchema.index({ status: 1 });
applicationSchema.index({ email: 1 });
applicationSchema.index({ createdAt: -1 });

export const VALID_STATUSES = ['draft', 'submitted', 'under-review', 'accepted', 'rejected'];
export const Application = mongoose.model('Application', applicationSchema);
