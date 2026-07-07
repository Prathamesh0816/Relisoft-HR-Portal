import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import crypto from 'crypto';

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
      validate: {
        validator: function (v) {
          return /^[^\s@]+@relisofttechnologies\.com$/.test(v);
        },
        message: 'Email must be a @relisofttechnologies.com address',
      },
    },
    password: { type: String, required: true, minlength: 6, select: false },
    employeeId: { type: String, unique: true, sparse: true },
    role: {
      type: String,
      enum: ['superadmin', 'admin', 'hr', 'manager', 'employee', 'finance', 'it'],
      default: 'employee',
    },
    roleValue: { type: Number, default: 1 },
    department: { type: String, trim: true },
    designation: { type: String, trim: true },
    phone: { type: String, trim: true },
    avatar: { type: String },
    status: {
      type: String,
      enum: ['active', 'inactive', 'suspended'],
      default: 'active',
    },
    lastLogin: { type: Date },
    refreshToken: { type: String },
    ssoId: { type: String, sparse: true },
    ssoProvider: { type: String, enum: ['azure-ad', 'local'], default: 'local' },
    resetPasswordToken: { type: String },
    resetPasswordExpire: { type: Date },
    username: { type: String, sparse: true },
  },
  { timestamps: true }
);

userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

userSchema.methods.matchPassword = async function (enteredPassword) {
  return bcrypt.compare(enteredPassword, this.password);
};

userSchema.methods.generateToken = function () {
  return jwt.sign({ id: this._id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRE || '7d',
  });
};

userSchema.methods.generateResetToken = function () {
  const resetToken = crypto.randomBytes(20).toString('hex');
  this.resetPasswordToken = crypto.createHash('sha256').update(resetToken).digest('hex');
  this.resetPasswordExpire = Date.now() + 10 * 60 * 1000;
  return resetToken;
};

export default mongoose.model('User', userSchema);
