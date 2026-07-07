import mongoose from 'mongoose';

const visitSchema = new mongoose.Schema({
  visitor: { type: mongoose.Schema.Types.ObjectId, ref: 'Visitor', required: true },
  host: { type: mongoose.Schema.Types.ObjectId, ref: 'Employee', required: true },
  purpose: { type: String, required: true },
  expectedDate: { type: Date, required: true },
  expectedTime: { type: String, required: true },
  status: { type: String, enum: ['Pending', 'Approved', 'CheckedIn', 'CheckedOut', 'Cancelled'], default: 'Pending' },
  gatePassNumber: { type: String },
  qrCode: { type: String },
  checkedInAt: { type: Date },
  checkedOutAt: { type: Date },
  badgeNumber: { type: String },
  notes: { type: String },
  approvedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'Employee' },
}, { timestamps: true });

export default mongoose.model('Visit', visitSchema);
