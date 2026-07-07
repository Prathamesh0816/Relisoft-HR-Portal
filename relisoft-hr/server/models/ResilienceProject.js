import mongoose from 'mongoose';

const resilienceProjectSchema = new mongoose.Schema(
  {
    projectId: {
      type: String,
      required: true,
      unique: true,
    },
    projectName: {
      type: String,
      required: true,
    },
    team: {
      type: String,
      required: true,
    },
    criticality: {
      type: String,
      enum: ['High', 'Medium', 'Low'],
      default: 'Medium',
    },
    deadlineDays: {
      type: Number,
      default: 0,
    },
    client: {
      type: String,
      default: '',
    },
    annualContractValueUsd: {
      type: Number,
      default: 0,
    },
    status: {
      type: String,
      enum: ['Active', 'Completed', 'At Risk'],
      default: 'Active',
    },
  },
  { timestamps: true }
);

export default mongoose.model('ResilienceProject', resilienceProjectSchema);
