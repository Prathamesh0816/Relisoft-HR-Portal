import mongoose from 'mongoose';

const softwareLicenseSchema = new mongoose.Schema({
  name: { type: String, required: true },
  publisher: { type: String },
  licenseType: { type: String, enum: ['perpetual', 'subscription', 'concurrent', 'perUser', 'openSource'], required: true },
  productKey: { type: String },
  totalSeats: { type: Number, required: true },
  usedSeats: { type: Number, default: 0 },
  purchaseDate: { type: Date },
  expiryDate: { type: Date },
  costPerSeat: { type: Number },
  totalCost: { type: Number },
  vendor: { type: mongoose.Schema.Types.ObjectId, ref: 'Vendor' },
  status: { type: String, enum: ['active', 'expiring', 'expired', 'cancelled'], default: 'active' },
  notes: { type: String },
  renewalReminderDays: { type: Number, default: 30 },
}, { timestamps: true });

export default mongoose.model('SoftwareLicense', softwareLicenseSchema);
