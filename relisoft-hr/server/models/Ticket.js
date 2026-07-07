import mongoose from 'mongoose';

const commentSubSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'Employee' },
    message: { type: String },
    attachment: { type: String },
    createdAt: { type: Date, default: Date.now },
  },
  { _id: false }
);

const attachmentSubSchema = new mongoose.Schema(
  {
    name: { type: String },
    fileUrl: { type: String },
  },
  { _id: false }
);

const ticketSchema = new mongoose.Schema(
  {
    ticketId: { type: String, unique: true },
    employee: { type: mongoose.Schema.Types.ObjectId, ref: 'Employee', required: true },
    category: {
      type: String,
      enum: ['hr', 'it', 'admin'],
      required: true,
    },
    subject: { type: String, required: true },
    description: { type: String },
    priority: {
      type: String,
      enum: ['low', 'medium', 'high', 'urgent'],
      default: 'medium',
    },
    status: {
      type: String,
      enum: ['open', 'in-progress', 'resolved', 'closed', 'on-hold'],
      default: 'open',
    },
    assignedTo: { type: mongoose.Schema.Types.ObjectId, ref: 'Employee' },
    department: { type: String },
    comments: [commentSubSchema],
    attachments: [attachmentSubSchema],
    resolvedAt: { type: Date },
    closedAt: { type: Date },
  },
  { timestamps: true }
);

ticketSchema.pre('save', async function (next) {
  if (this.isNew && !this.ticketId) {
    const count = await mongoose.model('Ticket').countDocuments();
    this.ticketId = `TKT-${String(count + 1).padStart(6, '0')}`;
  }
  next();
});

export default mongoose.model('Ticket', ticketSchema);
