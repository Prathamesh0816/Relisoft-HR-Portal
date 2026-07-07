import mongoose from 'mongoose';

const serviceRequestSchema = new mongoose.Schema({
  requestId: { type: String, unique: true },
  serviceItem: { type: mongoose.Schema.Types.ObjectId, ref: 'ServiceCatalog' },
  employee: { type: mongoose.Schema.Types.ObjectId, ref: 'Employee' },
  subject: { type: String, required: true },
  description: { type: String },
  formData: { type: mongoose.Schema.Types.Mixed },
  priority: { type: String, enum: ['low', 'medium', 'high', 'urgent'], default: 'medium' },
  status: {
    type: String, enum: ['draft', 'submitted', 'pending_approval', 'approved', 'in_progress', 'fulfilled', 'rejected', 'cancelled'], default: 'submitted',
  },
  assignedTo: { type: mongoose.Schema.Types.ObjectId, ref: 'Employee' },
  slaDeadline: { type: Date },
  slaBreached: { type: Boolean, default: false },
  approvalChain: [{
    approver: { type: mongoose.Schema.Types.ObjectId, ref: 'Employee' },
    status: { type: String, enum: ['pending', 'approved', 'rejected'], default: 'pending' },
    comment: String,
    decidedAt: Date,
  }],
  comments: [{
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'Employee' },
    text: String,
    attachment: String,
    createdAt: { type: Date, default: Date.now },
  }],
  attachments: [{ name: String, fileUrl: String }],
  fulfilledAt: Date,
}, { timestamps: true });

serviceRequestSchema.pre('save', async function (next) {
  if (this.isNew && !this.requestId) {
    const count = await mongoose.model('ServiceRequest').countDocuments();
    this.requestId = `SR-${String(count + 1).padStart(6, '0')}`;
  }
  next();
});

export default mongoose.model('ServiceRequest', serviceRequestSchema);
