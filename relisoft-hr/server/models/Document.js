import mongoose from 'mongoose';

const signatureSubSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'Employee' },
    role: { type: String },
    signedAt: { type: Date },
    ipAddress: { type: String },
  },
  { _id: false }
);

const documentSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    type: {
      type: String,
      enum: [
        'offer-letter',
        'appraisal-letter',
        'experience-letter',
        'policy',
        'memo',
        'hr-letter',
        'other',
      ],
      required: true,
    },
    template: { type: String },
    content: { type: String },
    employee: { type: mongoose.Schema.Types.ObjectId, ref: 'Employee' },
    generatedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'Employee' },
    status: {
      type: String,
      enum: ['draft', 'final', 'archived'],
      default: 'draft',
    },
    version: { type: Number, default: 1 },
    signatures: [signatureSubSchema],
    fileUrl: { type: String },
    tags: [{ type: String }],
  },
  { timestamps: true }
);

export default mongoose.model('Document', documentSchema);
