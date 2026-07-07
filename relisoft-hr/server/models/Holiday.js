import mongoose from 'mongoose';

const holidaySchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    date: { type: Date, required: true },
    day: { type: String },
    type: {
      type: String,
      enum: ['national', 'festival', 'optional'],
      required: true,
    },
    location: [{ type: String }],
    year: { type: Number },
    description: { type: String },
    status: {
      type: String,
      enum: ['active', 'inactive'],
      default: 'active',
    },
  },
  { timestamps: true }
);

export default mongoose.model('Holiday', holidaySchema);
