import mongoose from 'mongoose';

const contractorSchema = new mongoose.Schema({
  vendor: { type: mongoose.Schema.Types.ObjectId, ref: 'Vendor' },
  firstName: { type: String, required: true },
  lastName: { type: String, required: true },
  email: { type: String, required: true },
  phone: { type: String },
  role: { type: String, required: true },
  department: { type: String, required: true },
  reportingManager: { type: mongoose.Schema.Types.ObjectId, ref: 'Employee', required: true },
  contractStart: { type: Date, required: true },
  contractEnd: { type: Date },
  billingRate: { type: Number },
  billingFrequency: { type: String, enum: ['Hourly', 'Daily', 'Monthly', 'Fixed'] },
  status: { type: String, enum: ['Active', 'Inactive', 'Onboarding', 'Offboarded'], default: 'Onboarding' },
  documents: [{ type: String }],
  skills: [{ type: String }],
}, { timestamps: true });

export default mongoose.model('Contractor', contractorSchema);
