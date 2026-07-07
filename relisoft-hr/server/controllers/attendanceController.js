import Attendance from '../models/Attendance.js';
import Employee from '../models/Employee.js';

export const getAttendance = async (req, res) => {
  try {
    const { page = 1, limit = 10, startDate, endDate, employee: empId, department } = req.query;
    const query = {};
    if (startDate || endDate) {
      query.date = {};
      if (startDate) query.date.$gte = new Date(startDate);
      if (endDate) query.date.$lte = new Date(endDate);
    }
    if (empId) query.employee = empId;
    if (department) {
      const employees = await Employee.find({ department }).select('_id');
      query.employee = { $in: employees.map((e) => e._id) };
    }

    const attendance = await Attendance.find(query)
      .populate('employee', 'firstName lastName employeeId')
      .skip((page - 1) * limit)
      .limit(Number(limit))
      .sort('-date');

    const total = await Attendance.countDocuments(query);

    res.status(200).json({
      success: true,
      data: attendance,
      pagination: {
        page: Number(page),
        limit: Number(limit),
        total,
        pages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const getMyAttendance = async (req, res) => {
  try {
    const employee = await Employee.findOne({ userId: req.user.id });
    if (!employee) {
      return res.status(404).json({ success: false, message: 'Employee not found' });
    }

    const attendance = await Attendance.find({ employee: employee._id }).sort('-date');

    res.status(200).json({ success: true, data: attendance });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const punchIn = async (req, res) => {
  try {
    const employee = await Employee.findOne({ userId: req.user.id });
    if (!employee) {
      return res.status(404).json({ success: false, message: 'Employee not found' });
    }

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const existing = await Attendance.findOne({
      employee: employee._id,
      date: today,
    });

    if (existing && existing.punchIn) {
      return res.status(400).json({ success: false, message: 'Already punched in today' });
    }

    const attendance = await Attendance.create({
      employee: employee._id,
      date: today,
      punchIn: new Date(),
    });

    res.status(201).json({ success: true, data: attendance });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const punchOut = async (req, res) => {
  try {
    const employee = await Employee.findOne({ userId: req.user.id });
    if (!employee) {
      return res.status(404).json({ success: false, message: 'Employee not found' });
    }

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const attendance = await Attendance.findOne({
      employee: employee._id,
      date: today,
    });

    if (!attendance) {
      return res.status(400).json({ success: false, message: 'No punch in record found' });
    }

    if (attendance.punchOut) {
      return res.status(400).json({ success: false, message: 'Already punched out today' });
    }

    attendance.punchOut = new Date();
    const diffMs = attendance.punchOut - attendance.punchIn;
    attendance.totalHours = Math.round((diffMs / (1000 * 60 * 60)) * 100) / 100;
    await attendance.save();

    res.status(200).json({ success: true, data: attendance });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const getAttendanceSummary = async (req, res) => {
  try {
    const { month, year } = req.query;
    const m = parseInt(month) || new Date().getMonth();
    const y = parseInt(year) || new Date().getFullYear();

    const startDate = new Date(y, m, 1);
    const endDate = new Date(y, m + 1, 0);

    const attendance = await Attendance.find({
      date: { $gte: startDate, $lte: endDate },
    }).populate('employee', 'firstName lastName employeeId department');

    const summary = {
      totalRecords: attendance.length,
      present: attendance.filter((a) => a.status === 'present').length,
      absent: attendance.filter((a) => a.status === 'absent').length,
      late: attendance.filter((a) => a.status === 'late').length,
      halfDay: attendance.filter((a) => a.status === 'half-day').length,
      totalHours: attendance.reduce((sum, a) => sum + (a.totalHours || 0), 0),
    };

    res.status(200).json({ success: true, data: summary });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

import RegularizationRequest from '../models/RegularizationRequest.js';

export const requestRegularization = async (req, res) => {
  try {
    const employee = await Employee.findOne({ userId: req.user.id });
    if (!employee) return res.status(404).json({ success: false, message: 'Employee not found' });

    const { attendanceDate, expectedPunchIn, expectedPunchOut, reason } = req.body;
    if (!attendanceDate || !reason) {
      return res.status(400).json({ success: false, message: 'attendanceDate and reason are required' });
    }

    const existing = await RegularizationRequest.findOne({
      employee: employee._id,
      attendanceDate: new Date(attendanceDate),
      status: 'pending',
    });
    if (existing) {
      return res.status(400).json({ success: false, message: 'A pending regularization request already exists for this date' });
    }

    const attendance = await Attendance.findOne({ employee: employee._id, date: new Date(attendanceDate) });

    const request = await RegularizationRequest.create({
      employee: employee._id,
      attendanceDate: new Date(attendanceDate),
      expectedPunchIn: expectedPunchIn ? new Date(expectedPunchIn) : undefined,
      expectedPunchOut: expectedPunchOut ? new Date(expectedPunchOut) : undefined,
      actualPunchIn: attendance?.punchIn,
      actualPunchOut: attendance?.punchOut,
      reason,
    });

    res.status(201).json({ success: true, data: request });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const getMyRegularizationRequests = async (req, res) => {
  try {
    const employee = await Employee.findOne({ userId: req.user.id });
    if (!employee) return res.status(404).json({ success: false, message: 'Employee not found' });

    const requests = await RegularizationRequest.find({ employee: employee._id })
      .populate('reviewedBy', 'firstName lastName')
      .sort('-createdAt');

    res.status(200).json({ success: true, data: requests });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const getPendingRegularizationRequests = async (req, res) => {
  try {
    const { department } = req.query;
    const query = { status: 'pending' };
    if (department) {
      const employees = await Employee.find({ department }).select('_id');
      query.employee = { $in: employees.map((e) => e._id) };
    }
    const requests = await RegularizationRequest.find(query)
      .populate('employee', 'firstName lastName employeeId department')
      .sort('-createdAt');
    res.status(200).json({ success: true, data: requests });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const reviewRegularizationRequest = async (req, res) => {
  try {
    const { id } = req.params;
    const { status, reviewerComments } = req.body;
    if (!['approved', 'rejected'].includes(status)) {
      return res.status(400).json({ success: false, message: 'status must be approved or rejected' });
    }

    const adminEmployee = await Employee.findOne({ userId: req.user.id });
    if (!adminEmployee) return res.status(404).json({ success: false, message: 'Employee not found' });

    const request = await RegularizationRequest.findByIdAndUpdate(
      id,
      { status, reviewedBy: adminEmployee._id, reviewedAt: Date.now(), reviewerComments },
      { new: true }
    );

    if (!request) {
      return res.status(404).json({ success: false, message: 'Regularization request not found' });
    }

    if (status === 'approved') {
      const updateData = {};
      if (request.expectedPunchIn) updateData.punchIn = request.expectedPunchIn;
      if (request.expectedPunchOut) updateData.punchOut = request.expectedPunchOut;
      if (Object.keys(updateData).length > 0) {
        await Attendance.findOneAndUpdate(
          { employee: request.employee, date: request.attendanceDate },
          { $set: updateData },
        );
      }
    }

    res.status(200).json({ success: true, data: request });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const markAttendance = async (req, res) => {
  try {
    const { records } = req.body;

    const results = [];
    for (const record of records) {
      const existing = await Attendance.findOne({
        employee: record.employee,
        date: new Date(record.date),
      });

      if (existing) {
        Object.assign(existing, record);
        await existing.save();
        results.push(existing);
      } else {
        const att = await Attendance.create(record);
        results.push(att);
      }
    }

    res.status(200).json({ success: true, data: results });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
