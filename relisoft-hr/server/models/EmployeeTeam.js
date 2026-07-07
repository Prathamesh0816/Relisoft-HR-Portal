import mongoose from 'mongoose';

const employeeTeamSchema = new mongoose.Schema({
  employee: { type: mongoose.Schema.Types.ObjectId, ref: 'Employee', required: true },
  team: { type: mongoose.Schema.Types.ObjectId, ref: 'Team', required: true },
}, { timestamps: true });

employeeTeamSchema.index({ employee: 1, team: 1 }, { unique: true });

export default mongoose.model('EmployeeTeam', employeeTeamSchema);
