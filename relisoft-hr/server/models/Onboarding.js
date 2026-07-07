import mongoose from 'mongoose';

const documentSubSchema = new mongoose.Schema(
  {
    name: { type: String },
    fileUrl: { type: String },
    status: { type: String, enum: ['pending', 'received', 'verified'] },
    verifiedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'Employee' },
    verifiedAt: { type: Date },
  },
  { timestamps: true }
);

const assetSubSchema = new mongoose.Schema(
  {
    asset: { type: String },
    serialNumber: { type: String },
    issuedDate: { type: Date },
    returnedDate: { type: Date },
  },
  { _id: false }
);

const checklistSubSchema = new mongoose.Schema(
  {
    item: { type: String },
    completed: { type: Boolean, default: false },
    completedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'Employee' },
    completedAt: { type: Date },
  },
  { _id: false }
);

const onboardingSchema = new mongoose.Schema(
  {
    employee: { type: mongoose.Schema.Types.ObjectId, ref: 'Employee', required: true },
    joiningDate: { type: Date },
    offerLetterUrl: { type: String },
    bgvStatus: {
      type: String,
      enum: ['pending', 'clear', 'issue'],
      default: 'pending',
    },
    documentStatus: {
      type: String,
      enum: ['pending', 'received', 'verified'],
      default: 'pending',
    },
    documents: [documentSubSchema],
    itSetup: {
      laptop: { type: Boolean, default: false },
      monitor: { type: Boolean, default: false },
      email: { type: Boolean, default: false },
      access: { type: Boolean, default: false },
      vpn: { type: Boolean, default: false },
    },
    assetAllocation: [assetSubSchema],
    payrollSetup: {
      pan: { type: Boolean, default: false },
      bank: { type: Boolean, default: false },
      pf: { type: Boolean, default: false },
      esi: { type: Boolean, default: false },
    },
    orientationDate: { type: Date },
    buddy: { type: mongoose.Schema.Types.ObjectId, ref: 'Employee' },
    checklist: [checklistSubSchema],
    status: {
      type: String,
      enum: ['pending', 'in-progress', 'completed'],
      default: 'pending',
    },
  },
  { timestamps: true }
);

export default mongoose.model('Onboarding', onboardingSchema);
