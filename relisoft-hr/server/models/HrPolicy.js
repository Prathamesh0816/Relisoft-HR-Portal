import mongoose from 'mongoose';

const hrPolicySchema = new mongoose.Schema({
  allowHalfDayLeave: { type: Boolean, default: false },
}, { timestamps: true });

export default mongoose.model('HrPolicy', hrPolicySchema);
