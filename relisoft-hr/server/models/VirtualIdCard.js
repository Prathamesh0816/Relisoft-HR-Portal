import mongoose from 'mongoose';

const virtualIdCardSchema = new mongoose.Schema({
  employee: { type: mongoose.Schema.Types.ObjectId, ref: 'Employee', required: true, unique: true },
  cardNumber: { type: String, unique: true },
  qrCode: { type: String },
  issueDate: { type: Date, default: Date.now },
  expiryDate: { type: Date },
  status: { type: String, enum: ['active', 'suspended', 'expired'], default: 'active' },
  photo: { type: String },
  department: { type: String },
  designation: { type: String },
  bloodGroup: { type: String },
  emergencyContact: { type: String },
  isDigital: { type: Boolean, default: true },
  issuedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'Employee' },
}, { timestamps: true });

virtualIdCardSchema.pre('save', async function (next) {
  if (this.isNew && !this.cardNumber) {
    const count = await mongoose.model('VirtualIdCard').countDocuments();
    this.cardNumber = `ID-${String(count + 1).padStart(6, '0')}`;
  }
  next();
});

export default mongoose.model('VirtualIdCard', virtualIdCardSchema);
