import mongoose from 'mongoose';

const talentProfileSchema = new mongoose.Schema({
  employee: { type: mongoose.Schema.Types.ObjectId, ref: 'Employee', required: true, unique: true },
  performanceRating: { type: Number, min: 1, max: 5 },
  potentialRating: { type: Number, min: 1, max: 5 },
  talentSegment: { type: String, enum: ['HighPotential', 'Core', 'Underperformer', 'Emerging', 'Specialist'] },
  flightRiskScore: { type: Number, min: 0, max: 100 },
  successionReadiness: { type: String, enum: ['ReadyNow', 'ReadyFuture', 'NotReady'] },
  criticalRoleFlag: { type: Boolean, default: false },
  leadershipTier: { type: String, enum: ['Entry', 'Mid', 'Senior', 'Executive'] },
  developmentNeeds: [{ type: String }],
  lastReviewDate: { type: Date },
  notes: { type: String },
}, { timestamps: true });

export default mongoose.model('TalentProfile', talentProfileSchema);
