import Employee from '../models/Employee.js';
import Leave from '../models/Leave.js';
import Job from '../models/Job.js';
import Ticket from '../models/Ticket.js';
import Attendance from '../models/Attendance.js';
import Payroll from '../models/Payroll.js';

export const getHRSnapshot = async (req, res) => {
  try {
    const totalEmployees = await Employee.countDocuments({ isActive: true });
    const activeLeaves = await Leave.countDocuments({ status: 'approved' });
    const openPositions = await Job.countDocuments({ status: 'open' });
    const pendingTickets = await Ticket.countDocuments({ status: { $ne: 'resolved' } });
    const newHires = await Employee.countDocuments({
      isActive: true,
      dateOfJoining: { $gte: new Date(new Date().setMonth(new Date().getMonth() - 1)) },
    });

    res.status(200).json({
      success: true,
      data: {
        totalEmployees,
        activeLeaves,
        openPositions,
        pendingTickets,
        newHires,
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const getManagerDashboard = async (req, res) => {
  try {
    const manager = await Employee.findOne({ userId: req.user.id });
    if (!manager) {
      return res.status(404).json({ success: false, message: 'Manager not found' });
    }

    const teamSize = await Employee.countDocuments({ reportingTo: manager._id });
    const pendingApprovals = await Leave.countDocuments({
      status: 'pending',
    });
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const todayAttendance = await Attendance.countDocuments({
      date: today,
      status: 'present',
    });

    res.status(200).json({
      success: true,
      data: {
        teamSize,
        pendingApprovals,
        todayAttendance,
        manager: {
          name: `${manager.firstName} ${manager.lastName}`,
          department: manager.department,
        },
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const getEmployeeDashboard = async (req, res) => {
  try {
    const employee = await Employee.findOne({ userId: req.user.id });
    if (!employee) {
      return res.status(404).json({ success: false, message: 'Employee not found' });
    }

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const todayAttendance = await Attendance.findOne({
      employee: employee._id,
      date: today,
    });

    const pendingLeaves = await Leave.countDocuments({
      employee: employee._id,
      status: 'pending',
    });

    const upcomingLeaves = await Leave.find({
      employee: employee._id,
      startDate: { $gte: today },
      status: 'approved',
    }).sort('startDate').limit(5);

    const currentMonth = new Date().getMonth();
    const currentYear = new Date().getFullYear();
    const latestPayroll = await Payroll.findOne({
      employee: employee._id,
      month: currentMonth,
      year: currentYear,
    });

    res.status(200).json({
      success: true,
      data: {
        employee: {
          name: `${employee.firstName} ${employee.lastName}`,
          employeeId: employee.employeeId,
          department: employee.department,
        },
        todayAttendance: todayAttendance || null,
        leaveBalance: employee.leaveBalance,
        pendingLeaves,
        upcomingLeaves,
        latestPayroll,
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const getAdminDashboard = async (req, res) => {
  try {
    const totalEmployees = await Employee.countDocuments();
    const activeEmployees = await Employee.countDocuments({ status: 'active' });
    const departments = await Employee.distinct('department');
    const departmentCounts = {};

    for (const dept of departments) {
      if (dept) {
        departmentCounts[dept] = await Employee.countDocuments({
          department: dept,
          status: 'active',
        });
      }
    }

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const todayPresent = await Attendance.countDocuments({ date: today, status: 'present' });
    const todayAbsent = await Attendance.countDocuments({ date: today, status: 'absent' });

    const thisMonth = new Date().getMonth();
    const thisYear = new Date().getFullYear();
    const monthlyPayroll = await Payroll.find({ month: thisMonth, year: thisYear });
    const totalPayroll = monthlyPayroll.reduce((sum, p) => sum + (p.netPay || 0), 0);

    const openJobs = await Job.countDocuments({ status: 'open' });

    res.status(200).json({
      success: true,
      data: {
        totalEmployees,
        activeEmployees,
        departmentCounts,
        todayAttendance: { present: todayPresent, absent: todayAbsent },
        monthlyPayroll: { month: thisMonth, year: thisYear, total: totalPayroll },
        openPositions: openJobs,
        totalDepartments: departments.filter(Boolean).length,
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
