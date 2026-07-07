import mongoose from 'mongoose';

const onboardingProfileSchema = new mongoose.Schema({
  employee: { type: mongoose.Schema.Types.ObjectId, ref: 'Employee', required: true },
  panNumber: { type: String },
  aadhaarNumber: { type: String },
  hasPriorExperience: { type: Boolean, default: false },
  previousEmployerName: { type: String },
  yearsOfExperience: { type: Number },
  relievingEmailForwarded: { type: Boolean, default: false },
  lastUpdatedOn: { type: Date, default: Date.now },
}, { timestamps: true });

onboardingProfileSchema.index({ employee: 1 }, { unique: true });

export default mongoose.model('EmployeeOnboardingProfile', onboardingProfileSchema);
