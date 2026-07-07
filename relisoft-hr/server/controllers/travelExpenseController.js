import TravelRequest from '../models/TravelRequest.js';
import Expense from '../models/Expense.js';
import Employee from '../models/Employee.js';

export const getRequests = async (req, res) => {
  try {
    const { page = 1, limit = 10, status, type } = req.query;
    const query = {};
    if (status) query.status = status;
    if (type) query.type = type;

    const requests = await TravelRequest.find(query)
      .populate('employee', 'firstName lastName employeeId')
      .skip((page - 1) * limit)
      .limit(Number(limit))
      .sort('-createdAt');

    const total = await TravelRequest.countDocuments(query);

    res.status(200).json({
      success: true,
      data: requests,
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

export const getRequest = async (req, res) => {
  try {
    const request = await TravelRequest.findById(req.params.id).populate('employee');
    if (!request) {
      return res.status(404).json({ success: false, message: 'Request not found' });
    }
    res.status(200).json({ success: true, data: request });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const createRequest = async (req, res) => {
  try {
    const employee = await Employee.findOne({ userId: req.user.id });
    if (!employee) {
      return res.status(404).json({ success: false, message: 'Employee not found' });
    }

    const request = await TravelRequest.create({
      ...req.body,
      employee: employee._id,
    });

    res.status(201).json({ success: true, data: request });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const updateRequestStatus = async (req, res) => {
  try {
    const { status, reason } = req.body;

    const request = await TravelRequest.findByIdAndUpdate(
      req.params.id,
      { status, approvalReason: reason, reviewedAt: Date.now() },
      { new: true }
    );

    if (!request) {
      return res.status(404).json({ success: false, message: 'Request not found' });
    }

    res.status(200).json({ success: true, data: request });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const submitExpense = async (req, res) => {
  try {
    const expense = await Expense.create({
      ...req.body,
      employee: req.body.employee,
      bills: req.files ? req.files.map((f) => f.path) : [],
    });

    res.status(201).json({ success: true, data: expense });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const reimburseExpense = async (req, res) => {
  try {
    const expense = await Expense.findByIdAndUpdate(
      req.params.id,
      { status: 'reimbursed', reimbursedAt: Date.now() },
      { new: true }
    );

    if (!expense) {
      return res.status(404).json({ success: false, message: 'Expense not found' });
    }

    res.status(200).json({ success: true, data: expense });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const getMyRequests = async (req, res) => {
  try {
    const employee = await Employee.findOne({ userId: req.user.id });
    if (!employee) {
      return res.status(404).json({ success: false, message: 'Employee not found' });
    }

    const requests = await TravelRequest.find({ employee: employee._id }).sort('-createdAt');

    res.status(200).json({ success: true, data: requests });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
