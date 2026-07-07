import mongoose from 'mongoose';

const alumniSchema = new mongoose.Schema({
  employee: { type: mongoose.Schema.Types.ObjectId, ref: 'Employee' },
  firstName: String,
  lastName: String,
  email: String,
  phone: String,
  lastDesignation: String,
  lastDepartment: String,
  dateOfJoining: Date,
  dateOfLeaving: Date,
  linkedIn: String,
  currentCompany: String,
  currentPosition: String,
  city: String,
  state: String,
  country: String,
  willingToRejoin: { type: Boolean, default: false },
  newsletterOptIn: { type: Boolean, default: true },
  status: {
    type: String,
    enum: ['active', 'inactive'],
    default: 'active',
  },
}, { timestamps: true });

export default mongoose.model('Alumni', alumniSchema);
