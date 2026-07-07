import mongoose from 'mongoose';

const manpowerPlanSchema = new mongoose.Schema({
  fiscalYear: { type: String, required: true },
  department: { type: String, required: true },
  budgetedHeadcount: { type: Number, required: true },
  actualHeadcount: { type: Number, required: true },
  budgetedCost: { type: Number, required: true },
  actualCost: { type: Number, required: true },
  openPositions: { type: Number, required: true },
  attritionRate: { type: Number },
  plannedHires: { type: Number },
  forecastedHeadcount: { type: Number },
  quarter: { type: String, enum: ['Q1', 'Q2', 'Q3', 'Q4'] },
  notes: { type: String },
}, { timestamps: true });

export default mongoose.model('ManpowerPlan', manpowerPlanSchema);
