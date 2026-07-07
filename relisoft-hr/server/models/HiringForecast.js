import mongoose from 'mongoose';

const hiringForecastSchema = new mongoose.Schema({
  department: { type: String, required: true },
  role: { type: String, required: true },
  priority: { type: String, enum: ['Critical', 'High', 'Medium', 'Low'], required: true },
  estimatedCount: { type: Number, required: true },
  timeline: { type: String, enum: ['Immediate', 'ThisQuarter', 'NextQuarter', 'NextYear'], required: true },
  estimatedBudget: { type: Number },
  justification: { type: String },
  status: { type: String, enum: ['Approved', 'Pending', 'OnHold', 'Filled'], default: 'Pending' },
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'Employee' },
}, { timestamps: true });

export default mongoose.model('HiringForecast', hiringForecastSchema);
