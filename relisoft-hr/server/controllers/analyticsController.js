import Employee from '../models/Employee.js';
import Attendance from '../models/Attendance.js';
import Leave from '../models/Leave.js';
import Payroll from '../models/Payroll.js';
import Job from '../models/Job.js';
import Applicant from '../models/Applicant.js';

export const getHeadcountAnalytics = async (req, res) => {
  try {
    const employees = await Employee.find({ status: 'active' });

    const departmentWise = {};
    const locationWise = {};
    const genderWise = { male: 0, female: 0, other: 0 };

    for (const emp of employees) {
      const dept = emp.department || 'unknown';
      departmentWise[dept] = (departmentWise[dept] || 0) + 1;

      const loc = emp.location || 'unknown';
      locationWise[loc] = (locationWise[loc] || 0) + 1;

      const gender = emp.gender || 'other';
      genderWise[gender] = (genderWise[gender] || 0) + 1;
    }

    res.status(200).json({
      success: true,
      data: {
        total: employees.length,
        departmentWise,
        locationWise,
        genderWise,
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const getAttritionAnalytics = async (req, res) => {
  try {
    const { months = 12 } = req.query;
    const startDate = new Date();
    startDate.setMonth(startDate.getMonth() - parseInt(months));

    const exited = await Employee.countDocuments({
      status: 'exited',
      updatedAt: { $gte: startDate },
    });

    const active = await Employee.countDocuments({ status: 'active' });

    res.status(200).json({
      success: true,
      data: {
        periodMonths: parseInt(months),
        exited,
        active,
        attritionRate: active + exited > 0 ? (exited / (active + exited)) * 100 : 0,
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const getPayrollAnalytics = async (req, res) => {
  try {
    const { months = 6 } = req.query;
    const startDate = new Date();
    startDate.setMonth(startDate.getMonth() - parseInt(months));

    const payrolls = await Payroll.find({ createdAt: { $gte: startDate } }).populate(
      'employee',
      'department'
    );

    const monthly = {};
    const departmentWise = {};

    for (const p of payrolls) {
      const key = `${p.month}-${p.year}`;
      if (!monthly[key]) monthly[key] = { month: p.month, year: p.year, total: 0, count: 0 };
      monthly[key].total += p.netPay || 0;
      monthly[key].count++;

      const dept = p.employee?.department || 'unknown';
      if (!departmentWise[dept]) departmentWise[dept] = { total: 0, count: 0 };
      departmentWise[dept].total += p.netPay || 0;
      departmentWise[dept].count++;
    }

    res.status(200).json({
      success: true,
      data: { monthly: Object.values(monthly), departmentWise },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const getAttendanceAnalytics = async (req, res) => {
  try {
    const { month, year } = req.query;
    const m = parseInt(month) || new Date().getMonth();
    const y = parseInt(year) || new Date().getFullYear();

    const startDate = new Date(y, m, 1);
    const endDate = new Date(y, m + 1, 0);

    const attendance = await Attendance.find({
      date: { $gte: startDate, $lte: endDate },
    });

    const total = attendance.length;
    const present = attendance.filter((a) => a.status === 'present').length;
    const late = attendance.filter((a) => a.status === 'late').length;
    const latePercentage = total > 0 ? (late / total) * 100 : 0;
    const avgHours =
      total > 0
        ? attendance.reduce((sum, a) => sum + (a.totalHours || 0), 0) / total
        : 0;
    const overtime = attendance.filter(
      (a) => (a.totalHours || 0) > 8
    ).length;

    res.status(200).json({
      success: true,
      data: {
        month: m,
        year: y,
        totalRecords: total,
        present,
        late,
        latePercentage,
        averageHours: Math.round(avgHours * 100) / 100,
        overtime,
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const getLeaveAnalytics = async (req, res) => {
  try {
    const { year } = req.query;
    const y = parseInt(year) || new Date().getFullYear();

    const startDate = new Date(y, 0, 1);
    const endDate = new Date(y, 11, 31);

    const leaves = await Leave.find({
      startDate: { $gte: startDate },
      endDate: { $lte: endDate },
      status: 'approved',
    }).populate('employee', 'department');

    const byType = {};
    const monthly = {};
    const departmentWise = {};
    let totalDays = 0;

    for (const leave of leaves) {
      byType[leave.type] = (byType[leave.type] || 0) + leave.days;
      totalDays += leave.days;

      const month = new Date(leave.startDate).getMonth();
      monthly[month] = (monthly[month] || 0) + leave.days;

      const dept = leave.employee?.department || 'unknown';
      departmentWise[dept] = (departmentWise[dept] || 0) + leave.days;
    }

    res.status(200).json({
      success: true,
      data: {
        year: y,
        totalLeaves: leaves.length,
        totalDays,
        byType,
        monthly,
        departmentWise,
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const getRecruitmentAnalytics = async (req, res) => {
  try {
    const { months = 6 } = req.query;
    const startDate = new Date();
    startDate.setMonth(startDate.getMonth() - parseInt(months));

    const jobs = await Job.find({ createdAt: { $gte: startDate } });
    const applicants = await Applicant.find({ createdAt: { $gte: startDate } });

    const sourceWise = {};
    for (const app of applicants) {
      const src = app.source || 'direct';
      sourceWise[src] = (sourceWise[src] || 0) + 1;
    }

    const timeToHire = applicants
      .filter((a) => a.status === 'hired' && a.hiredAt)
      .map((a) => {
        const created = new Date(a.createdAt);
        const hired = new Date(a.hiredAt);
        return Math.ceil((hired - created) / (1000 * 60 * 60 * 24));
      });

    const avgTimeToHire =
      timeToHire.length > 0
        ? timeToHire.reduce((sum, t) => sum + t, 0) / timeToHire.length
        : 0;

    res.status(200).json({
      success: true,
      data: {
        totalJobs: jobs.length,
        totalApplicants: applicants.length,
        sourceWise,
        avgTimeToHire: Math.round(avgTimeToHire),
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
