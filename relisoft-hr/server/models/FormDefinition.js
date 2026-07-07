import mongoose from 'mongoose';

const validationSchema = new mongoose.Schema({
  regex: { type: String },
  min: { type: Number },
  max: { type: Number },
  customMessage: { type: String },
}, { _id: false });

const conditionSchema = new mongoose.Schema({
  fieldKey: { type: String },
  operator: { type: String },
  value: { type: String },
}, { _id: false });

const fieldSchema = new mongoose.Schema({
  type: { type: String, enum: ['text', 'number', 'date', 'dropdown', 'checkbox', 'radio', 'textarea', 'file', 'signature', 'email', 'phone'] },
  label: { type: String },
  key: { type: String },
  required: { type: Boolean },
  placeholder: { type: String },
  options: [{ type: String }],
  validation: validationSchema,
  condition: conditionSchema,
  order: { type: Number },
}, { _id: false });

const formDefinitionSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: { type: String },
  fields: [fieldSchema],
  status: { type: String, enum: ['Draft', 'Published', 'Archived'], default: 'Draft' },
  version: { type: Number, default: 1 },
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'Employee' },
}, { timestamps: true });

export default mongoose.model('FormDefinition', formDefinitionSchema);
