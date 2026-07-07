import mongoose from 'mongoose';

const shiftSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    startTime: { type: String, required: true },
    endTime: { type: String, required: true },
    gracePeriod: { type: Number, default: 0 },
    lateMarkAfter: { type: Number, default: 0 },
    earlyExitBefore: { type: Number, default: 0 },
    workingHours: { type: Number },
    isNightShift: { type: Boolean, default: false },
    days: {
      monday: { type: Boolean, default: true },
      tuesday: { type: Boolean, default: true },
      wednesday: { type: Boolean, default: true },
      thursday: { type: Boolean, default: true },
      friday: { type: Boolean, default: true },
      saturday: { type: Boolean, default: false },
      sunday: { type: Boolean, default: false },
    },
    colorCode: { type: String },
    description: { type: String },
    status: {
      type: String,
      enum: ['active', 'inactive'],
      default: 'active',
    },
  },
  { timestamps: true }
);

export default mongoose.model('Shift', shiftSchema);
