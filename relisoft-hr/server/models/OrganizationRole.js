import mongoose from 'mongoose';

const organizationRoleSchema = new mongoose.Schema({
  name: { type: String, required: true, unique: true, trim: true },
  label: { type: String, required: true, trim: true },
  baseRole: {
    type: String,
    enum: ['superadmin', 'admin', 'hr', 'manager', 'employee', 'finance', 'it'],
    default: 'employee',
  },
  roleValue: { type: Number, required: true, unique: true },
  isActive: { type: Boolean, default: true },
}, { timestamps: true });

export default mongoose.model('OrganizationRole', organizationRoleSchema);
