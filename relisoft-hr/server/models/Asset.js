import mongoose from 'mongoose';

const assetSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    type: {
      type: String,
      enum: ['laptop', 'monitor', 'keyboard', 'mouse', 'phone', 'tablet', 'other'],
      required: true,
    },
    brand: { type: String },
    model: { type: String },
    serialNumber: { type: String },
    assetTag: { type: String },
    purchaseDate: { type: Date },
    purchaseCost: { type: Number },
    warrantyExpiry: { type: Date },
    status: {
      type: String,
      enum: ['available', 'issued', 'lost', 'damaged', 'disposed'],
      default: 'available',
    },
    assignedTo: { type: mongoose.Schema.Types.ObjectId, ref: 'Employee' },
    issuedDate: { type: Date },
    returnDate: { type: Date },
    condition: {
      type: String,
      enum: ['new', 'good', 'fair', 'poor'],
      default: 'good',
    },
    notes: { type: String },
  },
  { timestamps: true }
);

export default mongoose.model('Asset', assetSchema);
