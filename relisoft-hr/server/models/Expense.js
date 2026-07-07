import mongoose from 'mongoose';

const expenseSchema = new mongoose.Schema({
  employee: { type: mongoose.Schema.Types.ObjectId, ref: 'Employee', required: true },
  category: {
    type: String,
    enum: ['travel', 'food', 'office', 'fuel', 'communication', 'health', 'training', 'other'],
    required: true,
  },
  description: String,
  amount: { type: Number, required: true },
  currency: { type: String, default: 'INR' },
  expenseDate: { type: Date, required: true },
  billNumber: String,
  billImage: String,
  project: String,
  approvalStatus: {
    type: String,
    enum: ['pending', 'approved', 'rejected', 'reimbursed'],
    default: 'pending',
  },
  approvedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'Employee' },
  approvalDate: Date,
  reimbursedDate: Date,
  remarks: String,
  paymentMode: {
    type: String,
    enum: ['bank', 'cash', 'cheque'],
  },
}, { timestamps: true });

export default mongoose.model('Expense', expenseSchema);
