import mongoose from 'mongoose';

const investmentSchema = new mongoose.Schema(
  { name: { type: String }, amount: { type: Number } },
  { _id: false }
);

const documentSchema = new mongoose.Schema(
  { name: { type: String }, url: { type: String } },
  { _id: false }
);

const taxDeclarationSchema = new mongoose.Schema(
  {
    employee: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Employee',
      required: true,
    },
    financialYear: { type: String, required: true },
    section80C: { type: Number, default: 0 },
    section80D: { type: Number, default: 0 },
    hraExemption: { type: Number, default: 0 },
    homeLoanInterest: { type: Number, default: 0 },
    section80E: { type: Number, default: 0 },
    section80G: { type: Number, default: 0 },
    otherInvestments: [investmentSchema],
    previousEmployerIncome: { type: Number, default: 0 },
    previousEmployerTax: { type: Number, default: 0 },
    totalIncome: { type: Number, default: 0 },
    totalDeductions: { type: Number, default: 0 },
    taxableIncome: { type: Number, default: 0 },
    taxLiability: { type: Number, default: 0 },
    tdsDeducted: { type: Number, default: 0 },
    status: {
      type: String,
      enum: ['Draft', 'Submitted', 'Verified', 'Approved'],
      default: 'Draft',
    },
    verifiedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'Employee' },
    documents: [documentSchema],
  },
  { timestamps: true }
);

taxDeclarationSchema.index({ employee: 1, financialYear: 1 }, { unique: true });

export default mongoose.model('TaxDeclaration', taxDeclarationSchema);
