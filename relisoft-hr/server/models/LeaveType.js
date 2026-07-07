import mongoose from 'mongoose';

const leaveTypeSchema = new mongoose.Schema({
  name: { type: String, required: true, unique: true },
  code: { type: String, unique: true, uppercase: true },
  description: { type: String },
  isPaid: { type: Boolean, default: true },
  isCompOff: { type: Boolean, default: false },
  isFloater: { type: Boolean, default: false },
  requiresAdvanceNotice: { type: Boolean, default: false },
  advanceNoticeDays: { type: Number, default: 0 },
  isAccrued: { type: Boolean, default: false },
  accrualPerMonth: { type: Number, default: 0 },
  maxConsecutiveDays: { type: Number },
  requiresDocumentation: { type: Boolean, default: false },
  colorCode: { type: String, default: '#6366f1' },
  isActive: { type: Boolean, default: true },
}, { timestamps: true });

export default mongoose.model('LeaveType', leaveTypeSchema);
