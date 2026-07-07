import mongoose from 'mongoose';

const dependentSchema = new mongoose.Schema({
  name: { type: String },
  relation: { type: String },
  dateOfBirth: { type: Date },
}, { _id: false });

const nomineeSchema = new mongoose.Schema({
  name: { type: String },
  relation: { type: String },
  percentage: { type: Number },
}, { _id: false });

const employeeBenefitSchema = new mongoose.Schema({
  employee: { type: mongoose.Schema.Types.ObjectId, ref: 'Employee', required: true },
  plan: { type: mongoose.Schema.Types.ObjectId, ref: 'BenefitPlan', required: true },
  status: { type: String, enum: ['Enrolled', 'Waived', 'Pending', 'Inactive'], default: 'Pending' },
  enrolledAt: { type: Date, default: Date.now },
  dependents: [dependentSchema],
  nominees: [nomineeSchema],
  coverageStart: { type: Date },
  coverageEnd: { type: Date },
}, { timestamps: true });

export default mongoose.model('EmployeeBenefit', employeeBenefitSchema);
