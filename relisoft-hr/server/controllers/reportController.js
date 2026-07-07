import Employee from '../models/Employee.js';
import Payroll from '../models/Payroll.js';
import Attendance from '../models/Attendance.js';
import Leave from '../models/Leave.js';
import Compliance from '../models/Compliance.js';

export const generateHRReport = async (req, res) => {
  try {
    const { department, status } = req.query;
    const query = {};
    if (department) query.department = department;
    if (status) query.status = status;

    const employees = await Employee.find(query).populate('department designation');

    const report = {
      generatedAt: new Date(),
      type: 'HR Report',
      filters: { department, status },
      totalEmployees: employees.length,
      employees: employees.map((e) => ({
        id: e.employeeId,
        name: `${e.firstName} ${e.lastName}`,
        department: e.department?.name,
        designation: e.designation?.title,
        status: e.status,
        joinDate: e.joinDate,
      })),
    };

    res.status(200).json({ success: true, data: report });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const generatePayrollReport = async (req, res) => {
  try {
    const { month, year, department } = req.query;
    const m = parseInt(month) || new Date().getMonth();
    const y = parseInt(year) || new Date().getFullYear();

    const query = { month: m, year: y };
    if (department) {
      const employees = await Employee.find({ department }).select('_id');
      query.employee = { $in: employees.map((e) => e._id) };
    }

    const payrolls = await Payroll.find(query).populate('employee', 'firstName lastName employeeId department');

    const report = {
      generatedAt: new Date(),
      type: 'Payroll Report',
      period: `${m + 1}/${y}`,
      totalEmployees: payrolls.length,
      totalGross: payrolls.reduce((sum, p) => sum + (p.grossPay || 0), 0),
      totalDeductions: payrolls.reduce((sum, p) => sum + (p.totalDeductions || 0), 0),
      totalNetPay: payrolls.reduce((sum, p) => sum + (p.netPay || 0), 0),
      records: payrolls.map((p) => ({
        employee: `${p.employee?.firstName} ${p.employee?.lastName}`,
        grossPay: p.grossPay,
        deductions: p.totalDeductions,
        netPay: p.netPay,
        status: p.status,
      })),
    };

    res.status(200).json({ success: true, data: report });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const generateAttendanceReport = async (req, res) => {
  try {
    const { month, year, department } = req.query;
    const m = parseInt(month) || new Date().getMonth();
    const y = parseInt(year) || new Date().getFullYear();

    const startDate = new Date(y, m, 1);
    const endDate = new Date(y, m + 1, 0);

    const query = { date: { $gte: startDate, $lte: endDate } };
    if (department) {
      const employees = await Employee.find({ department }).select('_id');
      query.employee = { $in: employees.map((e) => e._id) };
    }

    const attendance = await Attendance.find(query).populate('employee', 'firstName lastName employeeId department');

    const report = {
      generatedAt: new Date(),
      type: 'Attendance Report',
      period: `${m + 1}/${y}`,
      totalRecords: attendance.length,
      present: attendance.filter((a) => a.status === 'present').length,
      absent: attendance.filter((a) => a.status === 'absent').length,
      late: attendance.filter((a) => a.status === 'late').length,
      halfDay: attendance.filter((a) => a.status === 'half-day').length,
      averageHours: attendance.length > 0
        ? attendance.reduce((sum, a) => sum + (a.totalHours || 0), 0) / attendance.length
        : 0,
      records: attendance.map((a) => ({
        employee: `${a.employee?.firstName} ${a.employee?.lastName}`,
        date: a.date,
        punchIn: a.punchIn,
        punchOut: a.punchOut,
        totalHours: a.totalHours,
        status: a.status,
      })),
    };

    res.status(200).json({ success: true, data: report });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const generateLeaveReport = async (req, res) => {
  try {
    const { year, department, type } = req.query;
    const y = parseInt(year) || new Date().getFullYear();

    const startDate = new Date(y, 0, 1);
    const endDate = new Date(y, 11, 31);

    const query = {
      startDate: { $gte: startDate },
      endDate: { $lte: endDate },
    };
    if (type) query.type = type;
    if (department) {
      const employees = await Employee.find({ department }).select('_id');
      query.employee = { $in: employees.map((e) => e._id) };
    }

    const leaves = await Leave.find(query).populate('employee', 'firstName lastName employeeId department');

    const report = {
      generatedAt: new Date(),
      type: 'Leave Report',
      year: y,
      totalRequests: leaves.length,
      approved: leaves.filter((l) => l.status === 'approved').length,
      rejected: leaves.filter((l) => l.status === 'rejected').length,
      pending: leaves.filter((l) => l.status === 'pending').length,
      totalDays: leaves.reduce((sum, l) => sum + (l.days || 0), 0),
      records: leaves.map((l) => ({
        employee: `${l.employee?.firstName} ${l.employee?.lastName}`,
        type: l.type,
        startDate: l.startDate,
        endDate: l.endDate,
        days: l.days,
        status: l.status,
      })),
    };

    res.status(200).json({ success: true, data: report });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const generateComplianceReport = async (req, res) => {
  try {
    const { status, category } = req.query;
    const query = {};
    if (status) query.status = status;
    if (category) query.category = category;

    const compliances = await Compliance.find(query).sort('dueDate');

    const report = {
      generatedAt: new Date(),
      type: 'Compliance Report',
      total: compliances.length,
      completed: compliances.filter((c) => c.status === 'completed').length,
      pending: compliances.filter((c) => c.status === 'pending').length,
      overdue: compliances.filter((c) => c.status !== 'completed' && new Date(c.dueDate) < new Date()).length,
      records: compliances,
    };

    res.status(200).json({ success: true, data: report });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const exportToCSV = async (req, res) => {
  try {
    const { data, filename = 'export.csv' } = req.body;

    if (!data || !data.length) {
      return res.status(400).json({ success: false, message: 'No data to export' });
    }

    const headers = Object.keys(data[0]);
    const csvRows = [headers.join(',')];

    for (const row of data) {
      const values = headers.map((h) => {
        const val = row[h] || '';
        return typeof val === 'string' && val.includes(',') ? `"${val}"` : val;
      });
      csvRows.push(values.join(','));
    }

    const csv = csvRows.join('\n');

    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
    res.status(200).send(csv);
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const exportToPDF = async (req, res) => {
  try {
    const { title, data } = req.body;

    let html = `<html><head><title>${title || 'Report'}</title></head><body>`;
    html += `<h1>${title || 'Report'}</h1>`;
    html += `<p>Generated: ${new Date().toISOString()}</p>`;

    if (data && data.length > 0) {
      html += '<table border="1" cellpadding="5"><thead><tr>';
      const headers = Object.keys(data[0]);
      for (const h of headers) {
        html += `<th>${h}</th>`;
      }
      html += '</tr></thead><tbody>';
      for (const row of data) {
        html += '<tr>';
        for (const h of headers) {
          html += `<td>${row[h] || ''}</td>`;
        }
        html += '</tr>';
      }
      html += '</tbody></table>';
    }

    html += '</body></html>';

    res.status(200).json({ success: true, data: { html, title } });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
