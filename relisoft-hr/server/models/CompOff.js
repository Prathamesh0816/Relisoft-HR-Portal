import mongoose from 'mongoose';

const compOffSchema = new mongoose.Schema({
  employee: { type: mongoose.Schema.Types.ObjectId, ref: 'Employee', required: true },
  leaveType: { type: mongoose.Schema.Types.ObjectId, ref: 'LeaveType' },
  workedDate: { type: Date, required: true },
  reason: { type: String },
  status: {
    type: String,
    enum: ['Pending', 'Approved', 'Rejected', 'Expired'],
    default: 'Pending',
  },
  approvedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'Employee' },
  approvedOn: { type: Date },
  isExpired: { type: Boolean, default: false },
  expiryDate: { type: Date },
}, { timestamps: true });

compOffSchema.index({ employee: 1, workedDate: -1 });

export default mongoose.model('CompOff', compOffSchema);
