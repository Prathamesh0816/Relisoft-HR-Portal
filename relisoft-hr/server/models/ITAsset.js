import mongoose from 'mongoose';

const itAssetSchema = new mongoose.Schema({
  assetTag: { type: String, unique: true },
  type: { type: String, enum: ['laptop', 'desktop', 'monitor', 'keyboard', 'mouse', 'headset', 'phone', 'tablet', 'printer', 'server', 'network', 'other'], required: true },
  brand: { type: String, required: true },
  model: { type: String, required: true },
  serialNumber: { type: String, unique: true },
  processor: { type: String },
  ram: { type: String },
  storage: { type: String },
  osType: { type: String },
  osVersion: { type: String },
  macAddress: { type: String },
  ipAddress: { type: String },
  purchaseDate: { type: Date },
  purchaseCost: { type: Number },
  vendor: { type: mongoose.Schema.Types.ObjectId, ref: 'Vendor' },
  warrantyStart: { type: Date },
  warrantyExpiry: { type: Date },
  warrantyProvider: { type: String },
  status: { type: String, enum: ['available', 'issued', 'reserved', 'maintenance', 'lost', 'damaged', 'disposed'], default: 'available' },
  assignedTo: { type: mongoose.Schema.Types.ObjectId, ref: 'Employee' },
  assignedDate: { type: Date },
  expectedReturnDate: { type: Date },
  location: { type: String },
  condition: { type: String, enum: ['new', 'excellent', 'good', 'fair', 'poor'], default: 'good' },
  notes: { type: String },
  documents: [{ name: String, fileUrl: String }],
  ticketHistory: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Ticket' }],
}, { timestamps: true });

itAssetSchema.pre('save', async function (next) {
  if (this.isNew && !this.assetTag) {
    const count = await mongoose.model('ITAsset').countDocuments();
    this.assetTag = `IT-${String(count + 1).padStart(6, '0')}`;
  }
  next();
});

export default mongoose.model('ITAsset', itAssetSchema);
