import mongoose from 'mongoose';

const visitorSchema = new mongoose.Schema({
  firstName: { type: String, required: true },
  lastName: { type: String, required: true },
  email: { type: String, required: true },
  phone: { type: String },
  company: { type: String },
  idProof: { type: String },
  idProofNumber: { type: String },
  photo: { type: String },
  isBlacklisted: { type: Boolean, default: false },
}, { timestamps: true });

export default mongoose.model('Visitor', visitorSchema);
