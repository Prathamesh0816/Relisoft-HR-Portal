import mongoose from 'mongoose';

const leaveAccrualLogSchema = new mongoose.Schema({
  employee: { type: mongoose.Schema.Types.ObjectId, ref: 'Employee', required: true },
  leaveType: { type: mongoose.Schema.Types.ObjectId, ref: 'LeaveType', required: true },
  financialYear: { type: String, required: true },
  accruedLeaves: { type: Number, default: 0 },
  monthsCalculated: { type: Number, default: 0 },
  lastCalculatedAt: { type: Date, default: Date.now },
  createdAt: { type: Date, default: Date.now },
});

leaveAccrualLogSchema.index({ employee: 1, leaveType: 1, financialYear: 1 }, { unique: true });

export default mongoose.model('LeaveAccrualLog', leaveAccrualLogSchema);
