import mongoose from 'mongoose';

const purchaseOrderSchema = new mongoose.Schema({
  poNumber: { type: String, unique: true },
  requisition: { type: mongoose.Schema.Types.ObjectId, ref: 'PurchaseRequisition' },
  vendor: { type: mongoose.Schema.Types.ObjectId, ref: 'Vendor', required: true },
  items: [{
    description: { type: String, required: true },
    quantity: { type: Number, required: true },
    unit: String,
    unitPrice: { type: Number, required: true },
    totalPrice: { type: Number },
  }],
  subtotal: { type: Number },
  tax: { type: Number },
  shippingCost: { type: Number },
  totalAmount: { type: Number, required: true },
  currency: { type: String, default: 'INR' },
  paymentTerms: { type: String },
  deliveryDate: { type: Date },
  deliveryAddress: { type: String },
  status: { type: String, enum: ['draft', 'sent', 'accepted', 'partially_received', 'fully_received', 'cancelled'], default: 'draft' },
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'Employee' },
  approvedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'Employee' },
  notes: { type: String },
  attachments: [{ name: String, fileUrl: String }],
}, { timestamps: true });

purchaseOrderSchema.pre('save', async function (next) {
  if (this.isNew && !this.poNumber) {
    const count = await mongoose.model('PurchaseOrder').countDocuments();
    this.poNumber = `PO-${String(count + 1).padStart(6, '0')}`;
  }
  next();
});

export default mongoose.model('PurchaseOrder', purchaseOrderSchema);
