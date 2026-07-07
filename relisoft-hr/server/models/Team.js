import mongoose from 'mongoose';

const teamSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  project: { type: mongoose.Schema.Types.ObjectId, ref: 'Project', required: true },
  lead: { type: mongoose.Schema.Types.ObjectId, ref: 'Employee' },
}, { timestamps: true });

teamSchema.index({ name: 1, project: 1 }, { unique: true });

export default mongoose.model('Team', teamSchema);
