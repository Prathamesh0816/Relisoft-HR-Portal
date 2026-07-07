import mongoose from 'mongoose';

const licenseAllocationSchema = new mongoose.Schema({
  license: { type: mongoose.Schema.Types.ObjectId, ref: 'SoftwareLicense', required: true },
  employee: { type: mongoose.Schema.Types.ObjectId, ref: 'Employee', required: true },
  allocatedDate: { type: Date, default: Date.now },
  revokedDate: { type: Date },
  status: { type: String, enum: ['active', 'revoked', 'expired'], default: 'active' },
  deviceName: { type: String },
  notes: { type: String },
}, { timestamps: true });

export default mongoose.model('LicenseAllocation', licenseAllocationSchema);
