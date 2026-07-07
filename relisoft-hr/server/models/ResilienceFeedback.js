import mongoose from 'mongoose';

const resilienceFeedbackSchema = new mongoose.Schema(
  {
    employee: {
      type: String,
      required: true,
    },
    actionTitle: {
      type: String,
      required: true,
    },
    decision: {
      type: String,
      enum: ['accept', 'veto', 'modify'],
      required: true,
    },
    reason: {
      type: String,
      default: '',
    },
  },
  { timestamps: true }
);

export default mongoose.model('ResilienceFeedback', resilienceFeedbackSchema);
