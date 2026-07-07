import mongoose from 'mongoose';

const travelRequestSchema = new mongoose.Schema(
  {
    employee: { type: mongoose.Schema.Types.ObjectId, ref: 'Employee', required: true },
    type: { type: String, enum: ['domestic', 'international'], required: true },
    purpose: { type: String, required: true },
    fromLocation: { type: String, required: true },
    toLocation: { type: String, required: true },
    departureDate: { type: Date, required: true },
    returnDate: { type: Date, required: true },
    mode: { type: String, enum: ['flight', 'train', 'bus', 'cab', 'own'] },
    estimatedBudget: { type: Number },
    additionalNotes: { type: String },
    status: {
      type: String,
      enum: ['pending', 'approved', 'rejected', 'cancelled'],
      default: 'pending',
    },
    approvedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'Employee' },
    approvalDate: { type: Date },
    remarks: { type: String },
  },
  { timestamps: true }
);

export default mongoose.model('TravelRequest', travelRequestSchema);
