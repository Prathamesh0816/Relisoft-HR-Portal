import mongoose from 'mongoose';

const leaveSchema = new mongoose.Schema(
  {
    employee: { type: mongoose.Schema.Types.ObjectId, ref: 'Employee', required: true },
    leaveType: { type: mongoose.Schema.Types.ObjectId, ref: 'LeaveType', required: true },
    fromDate: { type: Date, required: true },
    toDate: { type: Date, required: true },
    totalDays: { type: Number, required: true },
    isHalfDay: { type: Boolean, default: false },
    reason: { type: String },
    status: {
      type: String,
      enum: ['Pending', 'Approved', 'Rejected', 'Cancelled'],
      default: 'Pending',
    },
    isLop: { type: Boolean, default: false },
    lopDays: { type: Number, default: 0 },
    isCompOff: { type: Boolean, default: false },
    workedDate: { type: Date },
    compOffExpiryDate: { type: Date },
    approver: { type: mongoose.Schema.Types.ObjectId, ref: 'Employee' },
    approvedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'Employee' },
    rejectedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'Employee' },
    approvalReason: { type: String },
    appliedOn: { type: Date, default: Date.now },
    approvedOn: { type: Date },
    rejectedOn: { type: Date },
  },
  { timestamps: true }
);

leaveSchema.index({ employee: 1, status: 1 });
leaveSchema.index({ approver: 1, status: 1 });

export default mongoose.model('Leave', leaveSchema);
