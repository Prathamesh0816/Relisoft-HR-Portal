import mongoose from 'mongoose';

const resilienceDependencySchema = new mongoose.Schema(
  {
    ownerId: {
      type: String,
      required: true,
    },
    ownerName: {
      type: String,
      required: true,
    },
    dependentId: {
      type: String,
      required: true,
    },
    dependentName: {
      type: String,
      required: true,
    },
    dependencyType: {
      type: String,
      default: 'knowledge',
    },
    criticality: {
      type: String,
      enum: ['High', 'Medium', 'Low'],
      default: 'Medium',
    },
  },
  { timestamps: true }
);

export default mongoose.model('ResilienceDependency', resilienceDependencySchema);
