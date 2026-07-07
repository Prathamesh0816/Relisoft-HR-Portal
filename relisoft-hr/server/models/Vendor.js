import mongoose from 'mongoose';

const vendorSchema = new mongoose.Schema({
  name: { type: String, required: true },
  contactPerson: { type: String },
  email: { type: String, required: true },
  phone: { type: String },
  address: { type: String },
  services: [{ type: String }],
  status: { type: String, enum: ['Active', 'Inactive', 'Blacklisted'], default: 'Active' },
}, { timestamps: true });

export default mongoose.model('Vendor', vendorSchema);
