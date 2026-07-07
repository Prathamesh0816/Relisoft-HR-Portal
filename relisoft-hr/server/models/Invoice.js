import mongoose from 'mongoose';

const invoiceSchema = new mongoose.Schema({
  invoiceNumber: { type: String, required: true },
  vendor: { type: mongoose.Schema.Types.ObjectId, ref: 'Vendor', required: true },
  purchaseOrder: { type: mongoose.Schema.Types.ObjectId, ref: 'PurchaseOrder' },
  goodsReceipt: { type: mongoose.Schema.Types.ObjectId, ref: 'GoodsReceipt' },
  invoiceDate: { type: Date },
  dueDate: { type: Date },
  amount: { type: Number, required: true },
  taxAmount: { type: Number },
  totalAmount: { type: Number },
  status: { type: String, enum: ['pending', 'under_review', 'matched', 'approved', 'paid', 'disputed', 'cancelled'], default: 'pending' },
  matchStatus: { type: String, enum: ['unmatched', 'matched', 'partial', 'discrepancy'], default: 'unmatched' },
  paymentDate: { type: Date },
  paymentMethod: { type: String },
  notes: { type: String },
  uploadedFile: { name: String, fileUrl: String },
}, { timestamps: true });

export default mongoose.model('Invoice', invoiceSchema);
