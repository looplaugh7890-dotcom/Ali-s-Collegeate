import mongoose from 'mongoose';

const paymentSchema = new mongoose.Schema({
  reference: { type: String, required: true, unique: true },
  amount: { type: Number, required: true },
  currency: { type: String, default: 'PKR' },
  method: { type: String, enum: ['bank-transfer', 'cash', 'online', 'stripe'], default: 'online' },
  status: { type: String, enum: ['unpaid', 'pending', 'paid', 'failed', 'refunded'], default: 'pending' },
  student: { type: mongoose.Schema.Types.ObjectId, ref: 'Student' },
  application: { type: mongoose.Schema.Types.ObjectId, ref: 'Application' },
  description: String,
  stripePaymentIntentId: String,
  stripeSessionId: String,
  paidAt: Date,
  metadata: { type: mongoose.Schema.Types.Mixed },
}, { timestamps: true });

paymentSchema.index({ student: 1 });
paymentSchema.index({ status: 1 });

export const Payment = mongoose.model('Payment', paymentSchema);
