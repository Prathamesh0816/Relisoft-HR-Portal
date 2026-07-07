import mongoose from 'mongoose';

const decisionSchema = new mongoose.Schema({
  employee: { type: mongoose.Schema.Types.ObjectId, ref: 'Employee' },
  action: { type: String },
  details: { type: String },
  effectiveDate: { type: Date },
}, { _id: false });

const talentReviewSchema = new mongoose.Schema({
  reviewCycle: { type: String, required: true },
  participants: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Employee' }],
  facilitator: { type: mongoose.Schema.Types.ObjectId, ref: 'Employee', required: true },
  status: { type: String, enum: ['Scheduled', 'InProgress', 'Completed'], default: 'Scheduled' },
  decisions: [decisionSchema],
  completedAt: { type: Date },
}, { timestamps: true });

export default mongoose.model('TalentReview', talentReviewSchema);
