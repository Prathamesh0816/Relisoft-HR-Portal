import Leave from '../models/Leave.js';
import Employee from '../models/Employee.js';
import LeaveType from '../models/LeaveType.js';
import { getRoleByValue } from '../utils/roleEnums.js';

export async function generateReport({ department, startDate, endDate, leaveTypeId, status, format }) {
  const filter = {};

  if (startDate || endDate) {
    filter.fromDate = {};
    if (startDate) filter.fromDate.$gte = new Date(startDate);
    if (endDate) filter.fromDate.$lte = new Date(endDate);
  }

  if (leaveTypeId) filter.leaveType = leaveTypeId;
  if (status) filter.status = status;

  let leaves = await Leave.find(filter)
    .populate('employee', 'firstName lastName employeeCode department designation roleValue')
    .populate('leaveType', 'name isPaid')
    .sort({ fromDate: -1 })
    .lean();

  if (department) {
    leaves = leaves.filter(l => l.employee?.department?.toLowerCase() === department.toLowerCase());
  }

  const rows = leaves.map(l => ({
    EmployeeCode: l.employee?.employeeCode || '',
    EmployeeName: `${l.employee?.firstName || ''} ${l.employee?.lastName || ''}`.trim(),
    Department: l.employee?.department || '',
    Designation: l.employee?.designation || '',
    Role: l.employee?.roleValue ? (getRoleByValue(l.employee.roleValue)?.label || '') : '',
    LeaveType: l.leaveType?.name || '',
    PaidLeave: l.leaveType?.isPaid ? 'Yes' : 'No',
    FromDate: l.fromDate,
    ToDate: l.toDate,
    Days: l.totalDays,
    IsHalfDay: l.isHalfDay ? 'Yes' : 'No',
    IsLOP: l.isLop ? 'Yes' : 'No',
    LOPDays: l.lopDays || 0,
    Status: l.status,
    Reason: l.reason || '',
    AppliedOn: l.appliedOn,
    ApprovedOn: l.approvedOn || '',
  }));

  if (format === 'csv') {
    return generateCsv(rows);
  }
  return rows;
}

function generateCsv(rows) {
  const headers = Object.keys(rows[0] || {});
  const csvLines = [headers.join(',')];

  for (const row of rows) {
    const values = headers.map(h => {
      const val = row[h];
      if (val instanceof Date) return val.toISOString().split('T')[0];
      const str = String(val ?? '');
      if (str.includes(',') || str.includes('"') || str.includes('\n')) {
        return `"${str.replace(/"/g, '""')}"`;
      }
      return str;
    });
    csvLines.push(values.join(','));
  }

  return csvLines.join('\n');
}
