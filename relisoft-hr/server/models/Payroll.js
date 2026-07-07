import mongoose from 'mongoose';

const payrollSchema = new mongoose.Schema(
  {
    employee: { type: mongoose.Schema.Types.ObjectId, ref: 'Employee', required: true },
    month: { type: Number, required: true },
    year: { type: Number, required: true },
    basicPay: { type: Number, default: 0 },
    hra: { type: Number, default: 0 },
    conveyanceAllowance: { type: Number, default: 0 },
    medicalAllowance: { type: Number, default: 0 },
    specialAllowance: { type: Number, default: 0 },
    lta: { type: Number, default: 0 },
    bonus: { type: Number, default: 0 },
    pf: { type: Number, default: 0 },
    esi: { type: Number, default: 0 },
    pt: { type: Number, default: 0 },
    tds: { type: Number, default: 0 },
    loanDeduction: { type: Number, default: 0 },
    otherDeductions: { type: Number, default: 0 },
    grossPay: { type: Number, default: 0 },
    totalDeductions: { type: Number, default: 0 },
    netPay: { type: Number, default: 0 },
    paymentDate: { type: Date },
    paymentMethod: {
      type: String,
      enum: ['bank', 'cheque', 'cash'],
    },
    status: {
      type: String,
      enum: ['draft', 'processed', 'paid', 'cancelled'],
      default: 'draft',
    },
    bankTransactionId: { type: String },
    notes: { type: String },
    processedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'Employee' },
  },
  { timestamps: true }
);

export default mongoose.model('Payroll', payrollSchema);
