import mongoose from 'mongoose';

const gatePassSchema = new mongoose.Schema({
  passNumber: { type: String, unique: true },
  type: { type: String, enum: ['visitor', 'candidate', 'new_joinee', 'employee', 'vendor', 'temp_staff'], required: true },
  status: { type: String, enum: ['active', 'expired', 'used', 'cancelled'], default: 'active' },
  fullName: { type: String, required: true },
  contactNumber: { type: String },
  email: { type: String },
  photo: { type: String },
  purpose: { type: String },
  company: { type: String },
  idProof: { type: String },
  idProofNumber: { type: String },
  visitingTo: { type: mongoose.Schema.Types.ObjectId, ref: 'Employee' },
  department: { type: String },
  validFrom: { type: Date, required: true },
  validTo: { type: Date, required: true },
  issuedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'Employee' },
  approvedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'Employee' },
  checkedInAt: { type: Date },
  checkedOutAt: { type: Date },
  assetBrought: { type: String },
  remarks: { type: String },
  qrCode: { type: String },
}, { timestamps: true });

gatePassSchema.pre('save', async function (next) {
  if (this.isNew && !this.passNumber) {
    const count = await mongoose.model('GatePass').countDocuments();
    this.passNumber = `GP-${String(count + 1).padStart(6, '0')}`;
  }
  next();
});

export default mongoose.model('GatePass', gatePassSchema);
