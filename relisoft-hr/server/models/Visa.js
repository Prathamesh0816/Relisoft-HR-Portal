import mongoose from 'mongoose';

const visaDocumentSchema = new mongoose.Schema({
  docType: {
    type: String,
    enum: ['passport', 'photograph', 'invitationLetter', 'bankStatement', 'itinerary', 'insurance', 'employmentLetter', 'previousVisa', 'other'],
  },
  title: { type: String },
  fileUrl: { type: String },
  uploadedAt: { type: Date, default: Date.now },
  expiryDate: { type: Date },
  verified: { type: Boolean, default: false },
}, { _id: false });

const visaApplicationSchema = new mongoose.Schema({
  employee: { type: mongoose.Schema.Types.ObjectId, ref: 'Employee', required: true },
  visaType: {
    type: String,
    enum: ['business', 'tourist', 'workPermit', 'transit', 'diplomatic'],
    required: true,
  },
  country: { type: String, required: true },
  purpose: { type: String },
  travelDates: {
    departure: { type: Date },
    return: { type: Date },
  },
  status: {
    type: String,
    enum: ['draft', 'documents-pending', 'submitted', 'under-processing', 'approved', 'rejected', 'collected'],
    default: 'draft',
  },
  submittedAt: { type: Date },
  decisionDate: { type: Date },
  validFrom: { type: Date },
  validUntil: { type: Date },
  entryType: { type: String, enum: ['single', 'double', 'multiple'] },
  durationOfStay: { type: Number },
  documents: [visaDocumentSchema],
  notes: { type: String },
  rejectionReason: { type: String },
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'Employee', required: true },
}, { timestamps: true });

const passportSchema = new mongoose.Schema({
  employee: { type: mongoose.Schema.Types.ObjectId, ref: 'Employee', required: true },
  passportNumber: { type: String, required: true },
  fullName: { type: String, required: true },
  nationality: { type: String, required: true },
  dateOfBirth: { type: Date },
  gender: { type: String },
  placeOfIssue: { type: String },
  issueDate: { type: Date },
  expiryDate: { type: Date, required: true },
  fileUrl: { type: String },
}, { timestamps: true });

export const VisaApplication = mongoose.model('VisaApplication', visaApplicationSchema);
export const PassportDetail = mongoose.model('PassportDetail', passportSchema);
