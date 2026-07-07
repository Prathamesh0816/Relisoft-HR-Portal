import mongoose from 'mongoose';

const reminderSubSchema = new mongoose.Schema(
  {
    daysBefore: { type: Number },
    sentAt: { type: Date },
  },
  { _id: false }
);

const attachmentSubSchema = new mongoose.Schema(
  {
    name: { type: String },
    fileUrl: { type: String },
  },
  { _id: false }
);

const complianceSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    type: {
      type: String,
      enum: ['labour-law', 'tax', 'esi', 'pf', 'pt', 'other'],
      required: true,
    },
    description: { type: String },
    applicableTo: [{ type: String }],
    frequency: {
      type: String,
      enum: ['monthly', 'quarterly', 'yearly', 'one-time'],
    },
    dueDate: { type: Date },
    reminders: [reminderSubSchema],
    status: {
      type: String,
      enum: ['pending', 'completed', 'overdue', 'waived'],
      default: 'pending',
    },
    completedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'Employee' },
    completedAt: { type: Date },
    notes: { type: String },
    attachments: [attachmentSubSchema],
  },
  { timestamps: true }
);

export default mongoose.model('Compliance', complianceSchema);
