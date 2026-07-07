import mongoose from 'mongoose';

const formSubmissionSchema = new mongoose.Schema({
  form: { type: mongoose.Schema.Types.ObjectId, ref: 'FormDefinition', required: true },
  employee: { type: mongoose.Schema.Types.ObjectId, ref: 'Employee', required: true },
  responses: { type: Map, of: String, required: true },
  status: { type: String, enum: ['Draft', 'Submitted', 'Reviewed', 'Approved', 'Rejected'], default: 'Submitted' },
  submittedAt: { type: Date, default: Date.now },
}, { timestamps: true });

export default mongoose.model('FormSubmission', formSubmissionSchema);
