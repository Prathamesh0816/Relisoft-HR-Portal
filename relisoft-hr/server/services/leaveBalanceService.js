import Employee from '../models/Employee.js';
import LeaveType from '../models/LeaveType.js';
import LeaveBalance from '../models/LeaveBalance.js';

class LeaveBalanceService {
  async updateLeaveBalances(rows) {
    let processed = 0;
    let failed = 0;
    const errors = [];

    for (const row of rows) {
      try {
        const employee = await Employee.findOne({ employeeCode: row.EmployeeCode });
        if (!employee) {
          errors.push(`Employee code '${row.EmployeeCode}' not found`);
          failed++;
          continue;
        }

        const leaveType = await LeaveType.findOne({ name: row.LeaveTypeName });
        if (!leaveType) {
          errors.push(`Leave type '${row.LeaveTypeName}' not found`);
          failed++;
          continue;
        }

        await LeaveBalance.findOneAndUpdate(
          { employee: employee._id, leaveType: leaveType._id },
          {
            employee: employee._id,
            leaveType: leaveType._id,
            allocatedLeaves: row.AllocatedLeaves,
            usedLeaves: row.UsedLeaves || 0,
          },
          { upsert: true }
        );
        processed++;
      } catch (err) {
        errors.push(`Error processing row: ${err.message}`);
        failed++;
      }
    }

    return { processed, failed, errors };
  }
}

export default new LeaveBalanceService();
