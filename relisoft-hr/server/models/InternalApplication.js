import mongoose from 'mongoose';

const internalApplicationSchema = new mongoose.Schema({
  posting: { type: mongoose.Schema.Types.ObjectId, ref: 'InternalJobPosting', required: true },
  employee: { type: mongoose.Schema.Types.ObjectId, ref: 'Employee', required: true },
  resume: { type: String },
  coverNote: { type: String },
  status: { type: String, enum: ['Applied', 'UnderReview', 'Shortlisted', 'Interviewed', 'Offered', 'Accepted', 'Rejected'], default: 'Applied' },
  currentManagerApproved: { type: Boolean },
  newManagerApproved: { type: Boolean },
  approvedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'Employee' },
  proposedStartDate: { type: Date },
}, { timestamps: true });

export default mongoose.model('InternalApplication', internalApplicationSchema);
