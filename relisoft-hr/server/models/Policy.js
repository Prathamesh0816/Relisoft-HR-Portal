import mongoose from 'mongoose';

const policySchema = new mongoose.Schema({
  title: { type: String, required: true },
  category: { type: String, enum: ['hr', 'it', 'finance', 'admin', 'compliance', 'other'], required: true },
  description: { type: String },
  content: { type: String },
  documentUrl: { type: String },
  version: { type: String, default: '1.0' },
  effectiveDate: { type: Date },
  expiryDate: { type: Date },
  owner: { type: mongoose.Schema.Types.ObjectId, ref: 'Employee' },
  status: { type: String, enum: ['draft', 'active', 'expired', 'archived'], default: 'draft' },
  requiresAcknowledgment: { type: Boolean, default: false },
  applicableRoles: [{ type: String }],
  tags: [{ type: String }],
}, { timestamps: true });

export default mongoose.model('Policy', policySchema);
