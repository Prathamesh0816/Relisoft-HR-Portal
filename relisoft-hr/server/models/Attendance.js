import mongoose from 'mongoose';

const attendanceSchema = new mongoose.Schema(
  {
    employee: { type: mongoose.Schema.Types.ObjectId, ref: 'Employee', required: true },
    date: { type: Date, required: true },
    punchIn: { type: Date },
    punchOut: { type: Date },
    status: {
      type: String,
      enum: ['present', 'absent', 'half-day', 'late', 'ot'],
      required: true,
    },
    lateMinutes: { type: Number, default: 0 },
    overtimeMinutes: { type: Number, default: 0 },
    workMode: {
      type: String,
      enum: ['office', 'wfh', 'field'],
      default: 'office',
    },
    location: { type: String },
    ipAddress: { type: String },
    deviceInfo: { type: String },
    notes: { type: String },
  },
  { timestamps: true }
);

export default mongoose.model('Attendance', attendanceSchema);
