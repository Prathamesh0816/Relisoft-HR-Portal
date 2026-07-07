import mongoose from 'mongoose';

const timeLogSchema = new mongoose.Schema({
  contractor: { type: mongoose.Schema.Types.ObjectId, ref: 'Contractor', required: true },
  date: { type: Date, required: true },
  hours: { type: Number, required: true },
  description: { type: String },
  billable: { type: Boolean, default: true },
}, { timestamps: true });

export default mongoose.model('TimeLog', timeLogSchema);
