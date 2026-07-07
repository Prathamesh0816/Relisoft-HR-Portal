import mongoose from 'mongoose';

const jobSchema = new mongoose.Schema(
  {
    jobTitle: { type: String, required: true },
    department: { type: String },
    location: { type: String },
    employmentType: { type: String, enum: ['full-time', 'part-time', 'contract', 'internship'] },
    vacancies: { type: Number, default: 1 },
    description: { type: String },
    requirements: { type: String },
    salaryRange: { type: String },
    status: { type: String, enum: ['active', 'closed', 'draft'], default: 'active' },
    postedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

export default mongoose.model('Job', jobSchema);
