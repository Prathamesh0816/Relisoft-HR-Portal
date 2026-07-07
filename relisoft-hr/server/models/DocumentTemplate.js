import mongoose from 'mongoose';

const templateSchema = new mongoose.Schema({
  name: { type: String, required: true },
  code: { type: String, required: true, unique: true },
  category: {
    type: String,
    enum: ['certificate', 'statutory', 'hr-letter', 'financial', 'compliance', 'noc', 'other'],
    required: true,
  },
  description: { type: String },
  watermarkText: { type: String, default: 'RELISOFT TECHNOLOGIES' },
  showWatermark: { type: Boolean, default: true },
  showLogo: { type: Boolean, default: true },
  showBorder: { type: Boolean, default: true },
  headerHtml: { type: String },
  bodyHtml: { type: String, required: true },
  footerHtml: { type: String },
  variables: [{ name: String, label: String, type: { type: String, enum: ['text', 'date', 'number', 'employee-field', 'select'], default: 'text' }, required: Boolean, defaultValue: String, options: [String], employeeField: String }],
  officialLink: { type: String },
  officialLinkText: { type: String, default: 'View Official Guidelines' },
  isActive: { type: Boolean, default: true },
  version: { type: Number, default: 1 },
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'Employee' },
}, { timestamps: true });

export default mongoose.model('DocumentTemplate', templateSchema);
