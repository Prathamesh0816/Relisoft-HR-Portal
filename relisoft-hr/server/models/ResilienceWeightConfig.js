import mongoose from 'mongoose';

const resilienceWeightConfigSchema = new mongoose.Schema(
  {
    key: {
      type: String,
      required: true,
      unique: true,
    },
    value: {
      type: Object,
      required: true,
    },
    source: {
      type: String,
      enum: ['default', 'user', 'ai'],
      default: 'default',
    },
  },
  { timestamps: true }
);

export default mongoose.model('ResilienceWeightConfig', resilienceWeightConfigSchema);
