import mongoose from 'mongoose';

const notificationSchema = new mongoose.Schema(
  {
    recipient: { type: mongoose.Schema.Types.ObjectId, ref: 'Employee', required: true },
    type: {
      type: String,
      enum: ['email', 'sms', 'whatsapp', 'in-app'],
      required: true,
    },
    module: { type: String },
    title: { type: String },
    message: { type: String },
    data: { type: mongoose.Schema.Types.Mixed },
    read: { type: Boolean, default: false },
    readAt: { type: Date },
    sentVia: [{ type: String }],
    sentAt: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

export default mongoose.model('Notification', notificationSchema);
