import mongoose from 'mongoose';

const benefitPlanSchema = new mongoose.Schema({
  name: { type: String, required: true },
  type: { type: String, enum: ['HealthInsurance', 'Dental', 'Life', 'Accidental', 'Wellness', 'Reimbursement', 'Others'], required: true },
  provider: { type: String },
  description: { type: String, required: true },
  coverageAmount: { type: Number },
  premium: { type: Number },
  eligibilityRules: { type: Object },
  isActive: { type: Boolean, default: true },
  enrollmentPeriod: {
    start: { type: Date },
    end: { type: Date },
  },
}, { timestamps: true });

export default mongoose.model('BenefitPlan', benefitPlanSchema);
