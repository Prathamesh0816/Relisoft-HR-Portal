import mongoose from 'mongoose';

const internalJobPostingSchema = new mongoose.Schema({
  title: { type: String, required: true },
  department: { type: String, required: true },
  location: { type: String, required: true },
  employmentType: { type: String, enum: ['Permanent', 'Contract', 'Secondment'], required: true },
  description: { type: String, required: true },
  requirements: { type: String, required: true },
  grade: { type: String },
  postedDate: { type: Date, default: Date.now },
  closingDate: { type: Date },
  status: { type: String, enum: ['Open', 'Closed', 'Filled', 'Cancelled'], default: 'Open' },
  postedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'Employee' },
}, { timestamps: true });

export default mongoose.model('InternalJobPosting', internalJobPostingSchema);
