import mongoose from 'mongoose';

const participantSubSchema = new mongoose.Schema(
  {
    employee: { type: mongoose.Schema.Types.ObjectId, ref: 'Employee' },
    status: {
      type: String,
      enum: ['registered', 'attended', 'completed', 'cancelled'],
      default: 'registered',
    },
    completionDate: { type: Date },
    certificateUrl: { type: String },
    feedback: { type: String },
    rating: { type: Number, min: 1, max: 5 },
  },
  { timestamps: true }
);

const trainingSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    description: { type: String },
    type: {
      type: String,
      enum: ['technical', 'soft-skill', 'compliance', 'leadership'],
    },
    mode: {
      type: String,
      enum: ['online', 'offline', 'hybrid'],
    },
    trainer: { type: String },
    trainerEmail: { type: String },
    startDate: { type: Date },
    endDate: { type: Date },
    duration: { type: String },
    location: { type: String },
    link: { type: String },
    maxParticipants: { type: Number },
    participants: [participantSubSchema],
    status: {
      type: String,
      enum: ['planned', 'in-progress', 'completed', 'cancelled'],
      default: 'planned',
    },
  },
  { timestamps: true }
);

export default mongoose.model('Training', trainingSchema);
