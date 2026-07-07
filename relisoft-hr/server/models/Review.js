import mongoose from 'mongoose';

const reviewSchema = new mongoose.Schema(
  {
    type: {
      type: String,
      enum: ['spec_review', 'code_review', 'ai_output'],
      required: true,
    },
    status: {
      type: String,
      enum: ['pending', 'approved', 'rejected', 'changes_requested'],
      default: 'pending',
    },
    specId: { type: String },
    specFile: { type: String },
    generatedCode: { type: mongoose.Schema.Types.Mixed },
    aiPrompt: { type: String },
    aiResponse: { type: mongoose.Schema.Types.Mixed },
    requestedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    reviewedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    reviewComments: { type: String },
    reviewedAt: { type: Date },
  },
  { timestamps: true }
);

export default mongoose.model('Review', reviewSchema);
