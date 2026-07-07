import mongoose from 'mongoose';

const purchaseRequisitionSchema = new mongoose.Schema({
  prNumber: { type: String, unique: true },
  requestedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'Employee', required: true },
  department: { type: String, required: true },
  items: [{
    description: { type: String, required: true },
    quantity: { type: Number, required: true },
    unit: { type: String, default: 'nos' },
    estimatedCost: { type: Number },
    category: { type: String },
  }],
  totalEstimatedCost: { type: Number },
  urgency: { type: String, enum: ['normal', 'urgent', 'critical'], default: 'normal' },
  purpose: { type: String },
  status: { type: String, enum: ['draft', 'pending', 'approved', 'rejected', 'ordered', 'cancelled'], default: 'draft' },
  approvedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'Employee' },
  approvedAt: { type: Date },
  rejectionReason: { type: String },
  poReference: { type: mongoose.Schema.Types.ObjectId, ref: 'PurchaseOrder' },
}, { timestamps: true });

purchaseRequisitionSchema.pre('save', async function (next) {
  if (this.isNew && !this.prNumber) {
    const count = await mongoose.model('PurchaseRequisition').countDocuments();
    this.prNumber = `PR-${String(count + 1).padStart(6, '0')}`;
  }
  next();
});

export default mongoose.model('PurchaseRequisition', purchaseRequisitionSchema);
