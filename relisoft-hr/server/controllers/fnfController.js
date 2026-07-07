import FnF from '../models/FnF.js';
import Employee from '../models/Employee.js';
import Separation from '../models/Separation.js';

export const initiateFnF = async (req, res) => {
  try {
    const { separationId } = req.params;
    const separation = await Separation.findById(separationId).populate('employee');
    if (!separation) {
      return res.status(404).json({ success: false, message: 'Separation not found' });
    }

    const existing = await FnF.findOne({ separation: separationId });
    if (existing) {
      return res.status(400).json({ success: false, message: 'FnF already initiated for this separation' });
    }

    const adminEmployee = await Employee.findOne({ userId: req.user.id });

    const fnf = await FnF.create({
      employee: separation.employee._id,
      separation: separationId,
      lastWorkingDate: separation.lastWorkingDay,
      preparedBy: adminEmployee._id,
      status: 'draft',
    });

    res.status(201).json({ success: true, data: fnf });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const getFnFBySeparation = async (req, res) => {
  try {
    const { separationId } = req.params;
    const fnf = await FnF.findOne({ separation: separationId })
      .populate('employee', 'firstName lastName employeeId')
      .populate('separation')
      .populate('approvedBy', 'firstName lastName')
      .populate('preparedBy', 'firstName lastName')
      .populate('clearanceStatus.clearedBy', 'firstName lastName');

    if (!fnf) {
      return res.status(404).json({ success: false, message: 'FnF not found' });
    }

    res.status(200).json({ success: true, data: fnf });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const updateFnF = async (req, res) => {
  try {
    const { id } = req.params;
    const fnf = await FnF.findByIdAndUpdate(id, req.body, { new: true, runValidators: true });

    if (!fnf) {
      return res.status(404).json({ success: false, message: 'FnF not found' });
    }

    res.status(200).json({ success: true, data: fnf });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const approveFnF = async (req, res) => {
  try {
    const adminEmployee = await Employee.findOne({ userId: req.user.id });

    const fnf = await FnF.findByIdAndUpdate(
      req.params.id,
      { status: 'approved', approvedBy: adminEmployee._id },
      { new: true }
    );

    if (!fnf) {
      return res.status(404).json({ success: false, message: 'FnF not found' });
    }

    await Separation.findByIdAndUpdate(fnf.separation, { fnfStatus: 'completed' });

    res.status(200).json({ success: true, data: fnf });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const disburseFnF = async (req, res) => {
  try {
    const { paymentReference } = req.body;

    const fnf = await FnF.findByIdAndUpdate(
      req.params.id,
      { status: 'disbursed', paymentReference, disbursedAt: Date.now() },
      { new: true }
    );

    if (!fnf) {
      return res.status(404).json({ success: false, message: 'FnF not found' });
    }

    res.status(200).json({ success: true, data: fnf });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const getPendingFnF = async (req, res) => {
  try {
    const fnfs = await FnF.find({ status: { $in: ['draft', 'pending-approval'] } })
      .populate('employee', 'firstName lastName employeeId')
      .populate('separation', 'lastWorkingDay reason type')
      .sort('-createdAt');

    res.status(200).json({ success: true, data: fnfs });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const getMyFnF = async (req, res) => {
  try {
    const employee = await Employee.findOne({ userId: req.user.id });
    if (!employee) {
      return res.status(404).json({ success: false, message: 'Employee not found' });
    }

    const fnf = await FnF.findOne({ employee: employee._id })
      .populate('employee', 'firstName lastName employeeId')
      .populate('approvedBy', 'firstName lastName');

    res.status(200).json({ success: true, data: fnf });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const updateClearance = async (req, res) => {
  try {
    const { id } = req.params;
    const { department, cleared, remarks } = req.body;

    const adminEmployee = await Employee.findOne({ userId: req.user.id });

    const fnf = await FnF.findById(id);
    if (!fnf) {
      return res.status(404).json({ success: false, message: 'FnF not found' });
    }

    const existingIdx = fnf.clearanceStatus.findIndex(c => c.department === department);
    const clearanceEntry = {
      department,
      cleared,
      clearedBy: adminEmployee._id,
      clearedAt: cleared ? Date.now() : null,
      remarks,
    };

    if (existingIdx >= 0) {
      fnf.clearanceStatus[existingIdx] = clearanceEntry;
    } else {
      fnf.clearanceStatus.push(clearanceEntry);
    }

    await fnf.save();

    res.status(200).json({ success: true, data: fnf });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
