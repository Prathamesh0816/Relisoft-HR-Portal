import mongoose from 'mongoose';

const serviceCatalogSchema = new mongoose.Schema({
  name: { type: String, required: true },
  description: { type: String },
  category: { type: mongoose.Schema.Types.ObjectId, ref: 'ServiceCategory' },
  type: { type: String, enum: ['it', 'hr', 'admin', 'facilities', 'finance'], required: true },
  priority: { type: String, enum: ['low', 'medium', 'high', 'urgent'], default: 'medium' },
  slaHours: { type: Number, default: 24 },
  approvalRequired: { type: Boolean, default: false },
  approverRole: [{ type: String }],
  workflow: { type: mongoose.Schema.Types.ObjectId, ref: 'Workflow' },
  formFields: [{
    label: String,
    type: { type: String, enum: ['text', 'textarea', 'select', 'date', 'file', 'number'] },
    required: Boolean,
    options: [String],
    key: String,
  }],
  isActive: { type: Boolean, default: true },
  autoAssignRole: { type: String },
}, { timestamps: true });

export default mongoose.model('ServiceCatalog', serviceCatalogSchema);
