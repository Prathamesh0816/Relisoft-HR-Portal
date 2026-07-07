import LeaveType from '../models/LeaveType.js';
import LeaveBalance from '../models/LeaveBalance.js';
import LeaveAccrualLog from '../models/LeaveAccrualLog.js';
import Employee from '../models/Employee.js';

function getFinancialYear(date) {
  const year = date.getFullYear();
  const month = date.getMonth() + 1;
  return month >= 4 ? `${year}-${year + 1}` : `${year - 1}-${year}`;
}

function monthsBetween(from, to) {
  return (to.getFullYear() - from.getFullYear()) * 12
    + (to.getMonth() - from.getMonth())
    + (to.getDate() >= from.getDate() ? 0 : -1);
}

class LeaveAccrualService {
  async syncAll() {
    const accruedLeaveTypes = await LeaveType.find({ isAccrued: true, accrualPerMonth: { $gt: 0 } });
    if (accruedLeaveTypes.length === 0) return;
    const employees = await Employee.find({ isActive: true }).lean();
    for (const emp of employees) {
      await this.syncEmployee(emp._id, accruedLeaveTypes);
    }
  }

  async syncEmployee(employeeId, accruedLeaveTypes) {
    if (!accruedLeaveTypes) {
      accruedLeaveTypes = await LeaveType.find({ isAccrued: true, accrualPerMonth: { $gt: 0 } });
    }
    if (accruedLeaveTypes.length === 0) return;

    const employee = await Employee.findById(employeeId);
    if (!employee || !employee.dateOfJoining) return;

    const joinDate = new Date(employee.dateOfJoining);
    const now = new Date();
    const currentFY = getFinancialYear(now);
    const fyStart = new Date(now.getFullYear(), 3, 1); // April 1st

    for (const lt of accruedLeaveTypes) {
      const accrualStart = joinDate > fyStart ? joinDate : fyStart;
      const monthsWorked = monthsBetween(accrualStart, now);
      const monthsWorkedTotal = monthsBetween(joinDate, now);

      const expectedAccrued = lt.accrualPerMonth > 0
        ? Math.max(0, Math.floor(monthsWorked * lt.accrualPerMonth))
        : 0;

      const expectedAccruedTotal = lt.accrualPerMonth > 0
        ? Math.max(0, Math.floor(monthsWorkedTotal * lt.accrualPerMonth))
        : 0;

      const balance = await LeaveBalance.findOne({
        employee: employeeId,
        leaveType: lt._id,
      });

      if (balance) {
        const used = balance.usedLeaves || 0;
        const requiredAllocated = Math.max(expectedAccruedTotal, used);
        if (balance.allocatedLeaves < requiredAllocated) {
          balance.allocatedLeaves = requiredAllocated;
          await balance.save();
        }
      }

      await LeaveAccrualLog.findOneAndUpdate(
        { employee: employeeId, leaveType: lt._id, financialYear: currentFY },
        {
          employee: employeeId,
          leaveType: lt._id,
          financialYear: currentFY,
          accruedLeaves: expectedAccrued,
          monthsCalculated: monthsWorked,
          lastCalculatedAt: now,
        },
        { upsert: true }
      );
    }
  }

  async getAccrualHistory(employeeId) {
    return await LeaveAccrualLog.find({ employee: employeeId })
      .populate('leaveType', 'name')
      .sort({ financialYear: -1 })
      .lean();
  }
}

export default new LeaveAccrualService();
