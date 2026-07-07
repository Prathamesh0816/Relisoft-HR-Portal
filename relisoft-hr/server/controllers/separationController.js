import Separation from '../models/Separation.js';
import Employee from '../models/Employee.js';

export const getSeparations = async (req, res) => {
  try {
    const { page = 1, limit = 10, status, type } = req.query;
    const query = {};
    if (status) query.status = status;
    if (type) query.type = type;

    const separations = await Separation.find(query)
      .populate('employee', 'firstName lastName employeeId department')
      .skip((page - 1) * limit)
      .limit(Number(limit))
      .sort('-createdAt');

    const total = await Separation.countDocuments(query);

    res.status(200).json({
      success: true,
      data: separations,
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

export const getSeparation = async (req, res) => {
  try {
    const separation = await Separation.findById(req.params.id)
      .populate('employee')
      .populate('clearances.department');

    if (!separation) {
      return res.status(404).json({ success: false, message: 'Separation not found' });
    }

    res.status(200).json({ success: true, data: separation });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const initiateSeparation = async (req, res) => {
  try {
    const employee = await Employee.findOne({ userId: req.user.id });
    if (!employee) {
      return res.status(404).json({ success: false, message: 'Employee not found' });
    }

    const existing = await Separation.findOne({
      employee: employee._id,
      status: { $in: ['initiated', 'in-progress'] },
    });

    if (existing) {
      return res.status(400).json({ success: false, message: 'Active separation already exists' });
    }

    const separation = await Separation.create({
      ...req.body,
      employee: employee._id,
      initiatedBy: req.user.id,
    });

    res.status(201).json({ success: true, data: separation });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const updateClearanceStatus = async (req, res) => {
  try {
    const { departmentId, status, remarks } = req.body;

    const separation = await Separation.findById(req.params.id);
    if (!separation) {
      return res.status(404).json({ success: false, message: 'Separation not found' });
    }

    const clearance = separation.clearances.id(departmentId);
    if (!clearance) {
      return res.status(404).json({ success: false, message: 'Clearance not found' });
    }

    clearance.status = status;
    clearance.remarks = remarks;
    clearance.processedAt = Date.now();
    clearance.processedBy = req.user.id;
    await separation.save();

    const allCleared = separation.clearances.every((c) => c.status === 'cleared');
    if (allCleared) {
      separation.status = 'clearance-completed';
      await separation.save();
    }

    res.status(200).json({ success: true, data: separation });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const completeSeparation = async (req, res) => {
  try {
    const separation = await Separation.findByIdAndUpdate(
      req.params.id,
      {
        status: 'completed',
        exitDate: Date.now(),
        completedAt: Date.now(),
      },
      { new: true }
    );

    if (!separation) {
      return res.status(404).json({ success: false, message: 'Separation not found' });
    }

    await Employee.findByIdAndUpdate(separation.employee, { status: 'exited' });

    res.status(200).json({ success: true, data: separation });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const calculateSettlement = async (req, res) => {
  try {
    const separation = await Separation.findById(req.params.id).populate('employee');
    if (!separation) {
      return res.status(404).json({ success: false, message: 'Separation not found' });
    }

    const employee = separation.employee;
    const monthlySalary = employee.salary?.basic || 0;
    const daysWorked = 30;
    const noticePeriodDays = employee.noticePeriod || 30;
    const gratuity = (monthlySalary * 15 / 26) * (employee.yearsOfService || 0);

    const settlement = {
      basicPay: monthlySalary,
      gratuity,
      noticePay: (monthlySalary / daysWorked) * noticePeriodDays,
      unpaidLeaves: 0,
      otherDeductions: 0,
      total: monthlySalary + gratuity + (monthlySalary / daysWorked) * noticePeriodDays,
    };

    res.status(200).json({ success: true, data: settlement });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const getMySeparation = async (req, res) => {
  try {
    const employee = await Employee.findOne({ userId: req.user.id });
    if (!employee) {
      return res.status(404).json({ success: false, message: 'Employee not found' });
    }

    const separation = await Separation.findOne({ employee: employee._id }).sort('-createdAt');

    res.status(200).json({ success: true, data: separation });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
