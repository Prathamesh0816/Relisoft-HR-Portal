import mongoose from 'mongoose';

const componentSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    type: { type: String, enum: ['Earnings', 'Deduction'], required: true },
    calculationType: {
      type: String,
      enum: ['Fixed', 'Percentage', 'Formula'],
      default: 'Fixed',
    },
    value: { type: Number, default: 0 },
    percentageOf: { type: String },
    formula: { type: String },
    isActive: { type: Boolean, default: true },
  },
  { _id: false }
);

const salaryStructureSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    description: { type: String },
    components: [componentSchema],
    isDefault: { type: Boolean, default: false },
    totalEarnings: { type: Number, default: 0 },
    totalDeductions: { type: Number, default: 0 },
    netTotal: { type: Number, default: 0 },
    applicableGrades: [{ type: String }],
    effectiveFrom: { type: Date },
    effectiveTo: { type: Date },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'Employee' },
    status: {
      type: String,
      enum: ['Active', 'Inactive', 'Archived'],
      default: 'Active',
    },
  },
  { timestamps: true }
);

export default mongoose.model('SalaryStructure', salaryStructureSchema);
