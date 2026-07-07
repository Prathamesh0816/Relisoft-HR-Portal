import mongoose from 'mongoose';

const questionSubSchema = new mongoose.Schema(
  {
    questionText: { type: String, required: true },
    questionType: {
      type: String,
      enum: ['text', 'rating', 'mcq', 'boolean'],
      required: true,
    },
    options: [{ type: String }],
    required: { type: Boolean, default: false },
  },
  { _id: false }
);

const answerSubSchema = new mongoose.Schema(
  {
    questionId: { type: String },
    answer: { type: String },
    rating: { type: Number },
    text: { type: String },
  },
  { _id: false }
);

const responseSubSchema = new mongoose.Schema(
  {
    employee: { type: mongoose.Schema.Types.ObjectId, ref: 'Employee' },
    answers: [answerSubSchema],
    submittedAt: { type: Date, default: Date.now },
  },
  { _id: false }
);

const surveySchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    description: { type: String },
    type: {
      type: String,
      enum: ['feedback', 'engagement', 'pulse', 'exit'],
      required: true,
    },
    questions: [questionSubSchema],
    targetDepartment: { type: String },
    targetDesignation: { type: String },
    startDate: { type: Date },
    endDate: { type: Date },
    status: {
      type: String,
      enum: ['draft', 'active', 'closed'],
      default: 'draft',
    },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'Employee' },
    responses: [responseSubSchema],
    anonymous: { type: Boolean, default: false },
  },
  { timestamps: true }
);

export default mongoose.model('Survey', surveySchema);
