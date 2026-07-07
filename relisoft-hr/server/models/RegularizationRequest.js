import mongoose from 'mongoose';

const regularizationRequestSchema = new mongoose.Schema({
  employee: { type: mongoose.Schema.Types.ObjectId, ref: 'Employee', required: true },
  attendanceDate: { type: Date, required: true },
  expectedPunchIn: { type: Date },
  expectedPunchOut: { type: Date },
  actualPunchIn: { type: Date },
  actualPunchOut: { type: Date },
  reason: { type: String, required: true },
  status: {
    type: String,
    enum: ['pending', 'approved', 'rejected'],
    default: 'pending',
  },
  reviewedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'Employee' },
  reviewedAt: { type: Date },
  reviewerComments: { type: String },
  appliedAt: { type: Date, default: Date.now },
}, { timestamps: true });

export default mongoose.model('RegularizationRequest', regularizationRequestSchema);
