import mongoose from 'mongoose';

const commentSchema = new mongoose.Schema({
  employee: { type: mongoose.Schema.Types.ObjectId, ref: 'Employee' },
  content: String,
  createdAt: { type: Date, default: Date.now },
}, { _id: false });

const attachmentSchema = new mongoose.Schema({
  name: String,
  fileUrl: String,
}, { _id: false });

const socialPostSchema = new mongoose.Schema({
  employee: { type: mongoose.Schema.Types.ObjectId, ref: 'Employee', required: true },
  content: { type: String, required: true },
  type: {
    type: String,
    enum: ['post', 'announcement', 'recognition', 'event', 'greeting'],
    default: 'post',
  },
  attachments: [attachmentSchema],
  likes: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Employee' }],
  comments: [commentSchema],
  visibility: {
    type: String,
    enum: ['all', 'department', 'team'],
    default: 'all',
  },
  pinned: { type: Boolean, default: false },
  status: {
    type: String,
    enum: ['active', 'archived'],
    default: 'active',
  },
}, { timestamps: true });

export default mongoose.model('SocialPost', socialPostSchema);
