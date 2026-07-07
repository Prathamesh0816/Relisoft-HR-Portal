import mongoose from 'mongoose';

const onboardingDocumentSchema = new mongoose.Schema({
  employee: { type: mongoose.Schema.Types.ObjectId, ref: 'Employee', required: true },
  documentType: { type: String, required: true },
  originalFileName: { type: String },
  storedFileName: { type: String },
  contentType: { type: String },
  relativePath: { type: String },
  uploadedOn: { type: Date, default: Date.now },
}, { timestamps: true });

export default mongoose.model('EmployeeOnboardingDocument', onboardingDocumentSchema);
