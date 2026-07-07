import mongoose from 'mongoose';

const applicantSubSchema = new mongoose.Schema(
  {
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
  },
  { timestamps: true }
);

const recruitmentSchema = new mongoose.Schema(
  {
    jobTitle: { type: String, required: true },
    department: { type: String },
    location: { type: String },
    employmentType: { type: String },
    vacancies: { type: Number, default: 1 },
    description: { type: String },
    requirements: { type: String },
    responsibilities: { type: String },
    salaryRange: { type: String },
    status: {
      type: String,
      enum: ['draft', 'open', 'closed', 'cancelled'],
      default: 'draft',
    },
    postedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'Employee' },
    postedDate: { type: Date },
    closingDate: { type: Date },
    applicants: [applicantSubSchema],
  },
  { timestamps: true }
);

export default mongoose.model('Recruitment', recruitmentSchema);
