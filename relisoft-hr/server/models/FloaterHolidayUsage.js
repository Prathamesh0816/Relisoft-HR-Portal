import mongoose from 'mongoose';

const floaterHolidayUsageSchema = new mongoose.Schema({
  employee: { type: mongoose.Schema.Types.ObjectId, ref: 'Employee', required: true },
  calendarYear: { type: Number, required: true },
  usedCount: { type: Number, default: 0, max: 2 },
}, { timestamps: true });

floaterHolidayUsageSchema.index({ employee: 1, calendarYear: 1 }, { unique: true });

export default mongoose.model('FloaterHolidayUsage', floaterHolidayUsageSchema);
