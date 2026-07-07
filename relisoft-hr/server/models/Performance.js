import mongoose from 'mongoose';

const kraSubSchema = new mongoose.Schema(
  {
    area: { type: String },
    weightage: { type: Number },
    target: { type: String },
    achievement: { type: String },
    selfRating: { type: Number, min: 1, max: 5 },
    managerRating: { type: Number, min: 1, max: 5 },
    comments: { type: String },
  },
  { _id: false }
);

const kpiSubSchema = new mongoose.Schema(
  {
    metric: { type: String },
    target: { type: Number },
    actual: { type: Number },
    weightage: { type: Number },
    score: { type: Number },
  },
  { _id: false }
);

const performanceSchema = new mongoose.Schema(
  {
    employee: { type: mongoose.Schema.Types.ObjectId, ref: 'Employee', required: true },
    reviewer: { type: mongoose.Schema.Types.ObjectId, ref: 'Employee' },
    reviewPeriod: {
      type: String,
      enum: ['Q1', 'Q2', 'Q3', 'Q4', 'H1', 'H2', 'Annual'],
      required: true,
    },
    year: { type: Number, required: true },
    kras: [kraSubSchema],
    kpis: [kpiSubSchema],
    overallRating: { type: Number, min: 1, max: 5 },
    selfComment: { type: String },
    managerComment: { type: String },
    status: {
      type: String,
      enum: ['draft', 'in-progress', 'completed'],
      default: 'draft',
    },
    reviewedAt: { type: Date },
  },
  { timestamps: true }
);

export default mongoose.model('Performance', performanceSchema);
