import mongoose from 'mongoose';

const approverSubSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'Employee' },
    order: { type: Number },
    status: {
      type: String,
      enum: ['pending', 'approved', 'rejected'],
      default: 'pending',
    },
  },
  { _id: false }
);

const stageSubSchema = new mongoose.Schema(
  {
    name: { type: String },
    type: {
      type: String,
      enum: ['approval', 'notification', 'task'],
    },
    approvers: [approverSubSchema],
    condition: { type: String },
    timeout: { type: Number },
    actions: { type: String },
  },
  { _id: false }
);

const workflowSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    module: { type: String },
    trigger: { type: String },
    stages: [stageSubSchema],
    status: {
      type: String,
      enum: ['active', 'inactive'],
      default: 'active',
    },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'Employee' },
  },
  { timestamps: true }
);

export default mongoose.model('Workflow', workflowSchema);
