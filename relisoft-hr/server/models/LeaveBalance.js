import mongoose from 'mongoose';

const leaveBalanceSchema = new mongoose.Schema({
  employee: { type: mongoose.Schema.Types.ObjectId, ref: 'Employee', required: true },
  leaveType: { type: mongoose.Schema.Types.ObjectId, ref: 'LeaveType', required: true },
  allocatedLeaves: { type: Number, default: 0 },
  usedLeaves: { type: Number, default: 0 },
  financialYear: { type: String },
}, { timestamps: true });

leaveBalanceSchema.index({ employee: 1, leaveType: 1 }, { unique: true });

export default mongoose.model('LeaveBalance', leaveBalanceSchema);
