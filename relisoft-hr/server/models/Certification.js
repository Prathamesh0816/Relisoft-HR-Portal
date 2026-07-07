import mongoose from 'mongoose';

const certificationSchema = new mongoose.Schema({
  employee: { type: mongoose.Schema.Types.ObjectId, ref: 'Employee', required: true },
  training: { type: mongoose.Schema.Types.ObjectId, ref: 'Training' },
  name: { type: String, required: true },
  issuer: { type: String },
  issueDate: { type: Date, required: true },
  expiryDate: { type: Date },
  certificateUrl: { type: String },
  credentialId: { type: String },
  status: {
    type: String,
    enum: ['active', 'expired', 'revoked'],
    default: 'active',
  },
  skills: [{ type: String }],
}, { timestamps: true });

certificationSchema.index({ employee: 1, name: 1 });
certificationSchema.index({ expiryDate: 1 }, { sparse: true });

export default mongoose.model('Certification', certificationSchema);
