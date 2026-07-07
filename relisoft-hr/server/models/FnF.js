import mongoose from 'mongoose';

const gratuityDetailSchema = new mongoose.Schema({
  yearsOfService: { type: Number },
  lastBasicDa: { type: Number },
  computedAmount: { type: Number },
  taxableAmount: { type: Number },
}, { _id: false });

const leaveEncashmentSchema = new mongoose.Schema({
  days: { type: Number },
  ratePerDay: { type: Number },
  amount: { type: Number },
}, { _id: false });

const clearanceSchema = new mongoose.Schema({
  department: { type: String, enum: ['it', 'admin', 'finance', 'hr'] },
  cleared: { type: Boolean, default: false },
  clearedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'Employee' },
  clearedAt: { type: Date },
  remarks: { type: String },
}, { _id: false });

const fnfSchema = new mongoose.Schema({
  employee: { type: mongoose.Schema.Types.ObjectId, ref: 'Employee', required: true },
  separation: { type: mongoose.Schema.Types.ObjectId, ref: 'Separation', required: true },
  initiatedDate: { type: Date, default: Date.now },
  lastWorkingDate: { type: Date, required: true },
  status: {
    type: String,
    enum: ['draft', 'pending-approval', 'approved', 'disbursed', 'completed', 'disputed'],
    default: 'draft',
  },
  earnings: {
    salaryUntilLWD: { type: Number, default: 0 },
    leaveEncashment: leaveEncashmentSchema,
    gratuity: gratuityDetailSchema,
    bonus: { type: Number, default: 0 },
    otherEarnings: { type: Number, default: 0 },
    totalEarnings: { type: Number, default: 0 },
  },
  deductions: {
    noticePeriodBuyout: { type: Number, default: 0 },
    assetRecovery: { type: Number, default: 0 },
    loanRecovery: { type: Number, default: 0 },
    incomeTaxRecovery: { type: Number, default: 0 },
    otherDeductions: { type: Number, default: 0 },
    totalDeductions: { type: Number, default: 0 },
  },
  netSettlementAmount: { type: Number, default: 0 },
  clearanceStatus: [clearanceSchema],
  settlementLetterUrl: { type: String },
  paymentReference: { type: String },
  disbursedAt: { type: Date },
  approvedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'Employee' },
  preparedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'Employee', required: true },
}, { timestamps: true });

fnfSchema.pre('save', function (next) {
  this.earnings.totalEarnings =
    (this.earnings.salaryUntilLWD || 0) +
    (this.earnings.leaveEncashment?.amount || 0) +
    (this.earnings.gratuity?.computedAmount || 0) +
    (this.earnings.bonus || 0) +
    (this.earnings.otherEarnings || 0);

  this.deductions.totalDeductions =
    (this.deductions.noticePeriodBuyout || 0) +
    (this.deductions.assetRecovery || 0) +
    (this.deductions.loanRecovery || 0) +
    (this.deductions.incomeTaxRecovery || 0) +
    (this.deductions.otherDeductions || 0);

  this.netSettlementAmount = this.earnings.totalEarnings - this.deductions.totalDeductions;
  next();
});

export default mongoose.model('FnF', fnfSchema);
