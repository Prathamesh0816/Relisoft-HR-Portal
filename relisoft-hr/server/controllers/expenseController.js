import Expense from '../models/Expense.js';
import Employee from '../models/Employee.js';

export const getExpenses = async (req, res) => {
  try {
    const { page = 1, limit = 10, category, status, startDate, endDate, employee } = req.query;
    const query = {};
    if (category) query.category = category;
    if (status) query.approvalStatus = status;
    if (employee) query.employee = employee;
    if (startDate || endDate) {
      query.expenseDate = {};
      if (startDate) query.expenseDate.$gte = new Date(startDate);
      if (endDate) query.expenseDate.$lte = new Date(endDate);
    }

    const expenses = await Expense.find(query)
      .populate('employee', 'firstName lastName employeeId')
      .populate('approvedBy', 'firstName lastName')
      .skip((page - 1) * limit)
      .limit(Number(limit))
      .sort('-createdAt');

    const total = await Expense.countDocuments(query);

    res.status(200).json({
      success: true,
      data: expenses,
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

export const getMyExpenses = async (req, res) => {
  try {
    const employee = await Employee.findOne({ userId: req.user.id });
    if (!employee) {
      return res.status(404).json({ success: false, message: 'Employee not found' });
    }

    const { page = 1, limit = 10, category, status, startDate, endDate } = req.query;
    const query = { employee: employee._id };
    if (category) query.category = category;
    if (status) query.approvalStatus = status;
    if (startDate || endDate) {
      query.expenseDate = {};
      if (startDate) query.expenseDate.$gte = new Date(startDate);
      if (endDate) query.expenseDate.$lte = new Date(endDate);
    }

    const expenses = await Expense.find(query)
      .skip((page - 1) * limit)
      .limit(Number(limit))
      .sort('-createdAt');

    const total = await Expense.countDocuments(query);

    res.status(200).json({
      success: true,
      data: expenses,
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

export const createExpense = async (req, res) => {
  try {
    const employee = await Employee.findOne({ userId: req.user.id });
    if (!employee) {
      return res.status(404).json({ success: false, message: 'Employee not found' });
    }

    const expense = await Expense.create({
      ...req.body,
      employee: employee._id,
    });

    res.status(201).json({ success: true, data: expense });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const updateExpenseStatus = async (req, res) => {
  try {
    const { status, remarks } = req.body;

    const adminEmployee = await Employee.findOne({ userId: req.user.id });
    if (!adminEmployee) {
      return res.status(404).json({ success: false, message: 'Employee not found' });
    }

    const update = {
      approvalStatus: status,
      approvedBy: adminEmployee._id,
      remarks,
    };
    if (status === 'approved') update.approvalDate = Date.now();
    if (status === 'reimbursed') update.reimbursedDate = Date.now();

    const expense = await Expense.findByIdAndUpdate(req.params.id, update, { new: true });

    if (!expense) {
      return res.status(404).json({ success: false, message: 'Expense not found' });
    }

    res.status(200).json({ success: true, data: expense });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const getExpenseSummary = async (req, res) => {
  try {
    const { startDate, endDate, department } = req.query;
    const match = {};
    if (startDate || endDate) {
      match.expenseDate = {};
      if (startDate) match.expenseDate.$gte = new Date(startDate);
      if (endDate) match.expenseDate.$lte = new Date(endDate);
    }

    const summary = await Expense.aggregate([
      { $match: match },
      {
        $group: {
          _id: null,
          totalAmount: { $sum: '$amount' },
          count: { $sum: 1 },
          pendingAmount: { $sum: { $cond: [{ $eq: ['$approvalStatus', 'pending'] }, '$amount', 0] } },
          approvedAmount: { $sum: { $cond: [{ $eq: ['$approvalStatus', 'approved'] }, '$amount', 0] } },
          reimbursedAmount: { $sum: { $cond: [{ $eq: ['$approvalStatus', 'reimbursed'] }, '$amount', 0] } },
        },
      },
    ]);

    const categoryBreakdown = await Expense.aggregate([
      { $match: match },
      { $group: { _id: '$category', total: { $sum: '$amount' }, count: { $sum: 1 } } },
    ]);

    res.status(200).json({
      success: true,
      data: {
        summary: summary[0] || { totalAmount: 0, count: 0, pendingAmount: 0, approvedAmount: 0, reimbursedAmount: 0 },
        categoryBreakdown,
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
