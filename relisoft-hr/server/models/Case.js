import mongoose from 'mongoose';

const timelineEntrySchema = new mongoose.Schema({
  action: { type: String },
  actor: { type: mongoose.Schema.Types.ObjectId, ref: 'Employee' },
  timestamp: { type: Date },
  details: { type: String },
}, { _id: false });

const caseSchema = new mongoose.Schema({
  caseNumber: { type: String, unique: true },
  title: { type: String, required: true },
  type: { type: String, enum: ['Grievance', 'Disciplinary', 'Investigation', 'Conflict', 'Whistleblower'], required: true },
  category: { type: String, enum: ['Harassment', 'Discrimination', 'PolicyViolation', 'Misconduct', 'Performance', 'Attendance', 'Others'], required: true },
  severity: { type: String, enum: ['Low', 'Medium', 'High', 'Critical'], required: true },
  reportedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'Employee', required: true },
  reportedEmployee: { type: mongoose.Schema.Types.ObjectId, ref: 'Employee' },
  description: { type: String, required: true },
  status: { type: String, enum: ['Open', 'UnderInvestigation', 'PendingDecision', 'Resolved', 'Closed', 'Dismissed'], default: 'Open' },
  assignedInvestigator: { type: mongoose.Schema.Types.ObjectId, ref: 'Employee' },
  priority: { type: String, enum: ['Low', 'Medium', 'High', 'Urgent'], default: 'Medium' },
  findings: { type: String },
  resolution: { type: String },
  action: { type: String, enum: ['VerbalWarning', 'WrittenWarning', 'Suspension', 'Termination', 'Training', 'NoAction'] },
  confidential: { type: Boolean, default: true },
  allowAnonymous: { type: Boolean },
  documents: [{ type: String }],
  timeline: [timelineEntrySchema],
  resolvedAt: { type: Date },
  resolvedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'Employee' },
}, { timestamps: true });

caseSchema.pre('save', function (next) {
  if (!this.caseNumber) {
    this.caseNumber = `CAS-${String(Math.floor(Math.random() * 100000)).padStart(5, '0')}`;
  }
  next();
});

export default mongoose.model('Case', caseSchema);
