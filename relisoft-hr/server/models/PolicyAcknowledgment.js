import mongoose from 'mongoose';

const policyAcknowledgmentSchema = new mongoose.Schema({
  policy: { type: mongoose.Schema.Types.ObjectId, ref: 'Policy', required: true },
  employee: { type: mongoose.Schema.Types.ObjectId, ref: 'Employee', required: true },
  acknowledgedAt: { type: Date, default: Date.now },
  status: { type: String, enum: ['pending', 'acknowledged', 'declined'], default: 'pending' },
  ipAddress: { type: String },
  userAgent: { type: String },
}, { timestamps: true });

policyAcknowledgmentSchema.index({ policy: 1, employee: 1 }, { unique: true });

export default mongoose.model('PolicyAcknowledgment', policyAcknowledgmentSchema);
