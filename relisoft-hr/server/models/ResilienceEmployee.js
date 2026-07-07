import mongoose from 'mongoose';

const resilienceEmployeeSchema = new mongoose.Schema(
  {
    employeeId: {
      type: String,
      required: true,
      unique: true,
    },
    name: {
      type: String,
      required: true,
    },
    team: {
      type: String,
      required: true,
    },
    role: {
      type: String,
      required: true,
    },
    criticality: {
      type: String,
      enum: ['High', 'Medium', 'Low'],
      default: 'Medium',
    },
    backupAvailable: {
      type: Boolean,
      default: false,
    },
    experienceYears: {
      type: Number,
      default: 0,
    },
    annualSalaryUsd: {
      type: Number,
      default: 0,
    },
    tenureYears: {
      type: Number,
      default: 0,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  { timestamps: true }
);

export default mongoose.model('ResilienceEmployee', resilienceEmployeeSchema);
