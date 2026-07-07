import mongoose from 'mongoose';

const profileChangeRequestSchema = new mongoose.Schema({
  employee: { type: mongoose.Schema.Types.ObjectId, ref: 'Employee', required: true },
  fieldName: { type: String, required: true },
  oldValue: { type: mongoose.Schema.Types.Mixed },
  newValue: { type: mongoose.Schema.Types.Mixed },
  section: { type: String, enum: ['personal', 'contact', 'bank', 'emergency', 'address', 'documents'], required: true },
  status: { type: String, enum: ['pending', 'approved', 'rejected'], default: 'pending' },
  reviewedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'Employee' },
  reviewedAt: { type: Date },
  reviewerNotes: { type: String },
}, { timestamps: true });

export default mongoose.model('ProfileChangeRequest', profileChangeRequestSchema);
