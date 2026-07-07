import mongoose from 'mongoose';

const travelExpenseSchema = new mongoose.Schema(
  {
    employee: { type: mongoose.Schema.Types.ObjectId, ref: 'Employee', required: true },
    travelType: {
      type: String,
      enum: ['domestic', 'international'],
    },
    requestType: {
      type: String,
      enum: ['travel', 'hotel', 'conveyance', 'misc'],
      required: true,
    },
    fromLocation: { type: String },
    toLocation: { type: String },
    departureDate: { type: Date },
    returnDate: { type: Date },
    purpose: { type: String },
    mode: {
      type: String,
      enum: ['flight', 'train', 'bus', 'cab', 'own'],
    },
    estimatedAmount: { type: Number },
    actualAmount: { type: Number },
    currency: { type: String, default: 'INR' },
    expenseDate: { type: Date },
    billUrl: { type: String },
    remarks: { type: String },
    status: {
      type: String,
      enum: ['pending', 'approved', 'rejected', 'reimbursed'],
      default: 'pending',
    },
    approvedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'Employee' },
    approvalDate: { type: Date },
    reimbursedDate: { type: Date },
  },
  { timestamps: true }
);

export default mongoose.model('TravelExpense', travelExpenseSchema);
