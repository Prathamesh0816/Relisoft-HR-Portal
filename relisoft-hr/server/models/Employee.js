import mongoose from 'mongoose';

const documentSubSchema = new mongoose.Schema(
  {
    name: { type: String },
    fileUrl: { type: String },
    type: { type: String },
    uploadedAt: { type: Date, default: Date.now },
  },
  { _id: false }
);

const employeeSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    employeeCode: { type: String, unique: true, sparse: true, trim: true },
    firstName: { type: String, required: true, trim: true },
    lastName: { type: String, trim: true },
    email: { type: String, lowercase: true, trim: true },
    phone: { type: String, trim: true },
    personalEmail: { type: String, lowercase: true, trim: true },
    dateOfBirth: { type: Date },
    gender: { type: String, enum: ['male', 'female', 'other'] },
    maritalStatus: { type: String },
    bloodGroup: { type: String },
    nationality: { type: String },
    aadharNumber: { type: String },
    panNumber: { type: String },
    uanNumber: { type: String },
    pfNumber: { type: String },
    bankName: { type: String },
    accountNumber: { type: String },
    ifscCode: { type: String },
    branch: { type: String },
    emergencyContactName: { type: String },
    emergencyContactPhone: { type: String },
    emergencyContactRelation: { type: String },
    permanentAddress: { type: String },
    currentAddress: { type: String },
    city: { type: String },
    state: { type: String },
    pincode: { type: String },
    department: { type: String },
    designation: { type: String },
    jobRole: { type: String },
    reportingTo: { type: mongoose.Schema.Types.ObjectId, ref: 'Employee' },
    dateOfJoining: { type: Date },
    dateOfConfirmation: { type: Date },
    employmentType: {
      type: String,
      enum: ['permanent', 'contract', 'intern', 'trainee'],
    },
    workLocation: { type: String },
    salaryStructureDetails: { type: String },
    employmentStatus: { type: String },
    profileImage: { type: String },
    documents: [documentSubSchema],
    primaryTeam: { type: mongoose.Schema.Types.ObjectId, ref: 'Team' },
    organizationRole: { type: mongoose.Schema.Types.ObjectId, ref: 'OrganizationRole' },
    roleValue: { type: Number, default: 1 },
    isActive: { type: Boolean, default: true },
    createdAt: { type: Date },
    updatedAt: { type: Date },
  },
  { timestamps: true }
);

export default mongoose.model('Employee', employeeSchema);
