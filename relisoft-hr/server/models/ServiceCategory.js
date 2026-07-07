import mongoose from 'mongoose';

const serviceCategorySchema = new mongoose.Schema({
  name: { type: String, required: true },
  description: { type: String },
  icon: { type: String },
  displayOrder: { type: Number, default: 0 },
  isActive: { type: Boolean, default: true },
}, { timestamps: true });

export default mongoose.model('ServiceCategory', serviceCategorySchema);
