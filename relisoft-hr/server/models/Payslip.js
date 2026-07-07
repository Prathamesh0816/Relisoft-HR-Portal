import mongoose from 'mongoose';

const payslipEarningSchema = new mongoose.Schema(
  { name: { type: String }, amount: { type: Number } },
  { _id: false }
);

const payslipDeductionSchema = new mongoose.Schema(
  { name: { type: String }, amount: { type: Number } },
  { _id: false }
);

const payslipSchema = new mongoose.Schema(
  {
    employee: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Employee',
      required: true,
    },
    month: { type: Number, required: true },
    year: { type: Number, required: true },
    salaryStructure: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'SalaryStructure',
    },
    earnings: [payslipEarningSchema],
    deductions: [payslipDeductionSchema],
    grossEarnings: { type: Number, default: 0 },
    grossDeductions: { type: Number, default: 0 },
    netPay: { type: Number, default: 0 },
    totalDays: { type: Number, default: 30 },
    daysWorked: { type: Number },
    daysPaid: { type: Number },
    arrears: { type: Number, default: 0 },
    loanRecovery: { type: Number, default: 0 },
    previousDue: { type: Number, default: 0 },
    totalPayable: { type: Number, default: 0 },
    amountInWords: { type: String },
    bankName: { type: String },
    bankAccount: { type: String },
    paymentDate: { type: Date },
    status: {
      type: String,
      enum: ['Generated', 'Approved', 'Paid', 'Cancelled'],
      default: 'Generated',
    },
    notes: { type: String },
  },
  { timestamps: true }
);

payslipSchema.index({ employee: 1, month: 1, year: 1 }, { unique: true });

export default mongoose.model('Payslip', payslipSchema);
