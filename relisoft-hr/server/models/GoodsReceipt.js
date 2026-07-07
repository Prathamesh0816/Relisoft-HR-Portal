import mongoose from 'mongoose';

const goodsReceiptSchema = new mongoose.Schema({
  grnNumber: { type: String, unique: true },
  purchaseOrder: { type: mongoose.Schema.Types.ObjectId, ref: 'PurchaseOrder', required: true },
  receivedDate: { type: Date, default: Date.now },
  receivedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'Employee' },
  items: [{
    description: String,
    quantityOrdered: Number,
    quantityReceived: Number,
    quantityAccepted: Number,
    quantityRejected: Number,
    rejectionReason: String,
  }],
  status: { type: String, enum: ['pending', 'completed', 'partially_completed'], default: 'pending' },
  notes: { type: String },
  attachments: [{ name: String, fileUrl: String }],
}, { timestamps: true });

goodsReceiptSchema.pre('save', async function (next) {
  if (this.isNew && !this.grnNumber) {
    const count = await mongoose.model('GoodsReceipt').countDocuments();
    this.grnNumber = `GRN-${String(count + 1).padStart(6, '0')}`;
  }
  next();
});

export default mongoose.model('GoodsReceipt', goodsReceiptSchema);
