import mongoose from 'mongoose';

const permissionSchema = new mongoose.Schema(
  {
    create: { type: Boolean, default: false },
    read: { type: Boolean, default: false },
    update: { type: Boolean, default: false },
    delete: { type: Boolean, default: false },
    approve: { type: Boolean, default: false },
  },
  { _id: false }
);

const roleSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, unique: true, trim: true },
    description: { type: String },
    permissions: { type: Map, of: permissionSchema, default: {} },
    isSystem: { type: Boolean, default: false },
  },
  { timestamps: true }
);

export default mongoose.model('Role', roleSchema);
