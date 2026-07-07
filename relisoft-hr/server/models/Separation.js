import mongoose from 'mongoose';

const clearanceSubSchema = new mongoose.Schema(
  {
    department: { type: String },
    clearedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'Employee' },
    clearedAt: { type: Date },
    status: { type: String },
    remarks: { type: String },
  },
  { _id: false }
);

const exitInterviewSubSchema = new mongoose.Schema(
  {
    question: { type: String },
    answer: { type: String },
  },
  { _id: false }
);

const separationSchema = new mongoose.Schema(
  {
    employee: { type: mongoose.Schema.Types.ObjectId, ref: 'Employee', required: true },
    resignationDate: { type: Date },
    lastWorkingDay: { type: Date },
    reason: { type: String },
    type: {
      type: String,
      enum: ['resignation', 'retirement', 'terminated', 'absconding'],
    },
    status: {
      type: String,
      enum: ['pending', 'approved', 'rejected', 'in-process', 'completed'],
      default: 'pending',
    },
    clearance: [clearanceSubSchema],
    exitInterview: [exitInterviewSubSchema],
    fnfStatus: {
      type: String,
      enum: ['pending', 'in-process', 'completed'],
      default: 'pending',
    },
    settlementAmount: { type: Number },
    recoveryAmount: { type: Number },
    noticePeriodDays: { type: Number },
    buybackAmount: { type: Number },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'Employee' },
  },
  { timestamps: true }
);

export default mongoose.model('Separation', separationSchema);
