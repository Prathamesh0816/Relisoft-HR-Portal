import mongoose from 'mongoose';

const applicantSchema = new mongoose.Schema(
  {
    job: { type: mongoose.Schema.Types.ObjectId, ref: 'Job', required: true },
    name: { type: String, required: true },
    email: { type: String, lowercase: true, trim: true },
    phone: { type: String },
    resumeUrl: { type: String },
    coverLetter: { type: String },
    appliedDate: { type: Date, default: Date.now },
    status: {
      type: String,
      enum: ['new', 'shortlisted', 'interviewed', 'offered', 'hired', 'rejected'],
      default: 'new',
    },
    interviewDate: { type: Date },
    interviewFeedback: { type: String },
    rating: { type: Number, min: 1, max: 5 },
    candidate: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  },
  { timestamps: true }
);

export default mongoose.model('Applicant', applicantSchema);
