import Ticket from '../models/Ticket.js';
import Employee from '../models/Employee.js';

export const getTickets = async (req, res) => {
  try {
    const { page = 1, limit = 10, status, priority, category, department } = req.query;
    const query = {};
    if (status) query.status = status;
    if (priority) query.priority = priority;
    if (category) query.category = category;
    if (department) query.department = department;

    const tickets = await Ticket.find(query)
      .populate('raisedBy', 'firstName lastName employeeId')
      .populate('assignedTo', 'firstName lastName')
      .skip((page - 1) * limit)
      .limit(Number(limit))
      .sort('-createdAt');

    const total = await Ticket.countDocuments(query);

    res.status(200).json({
      success: true,
      data: tickets,
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

export const getTicket = async (req, res) => {
  try {
    const ticket = await Ticket.findById(req.params.id)
      .populate('raisedBy')
      .populate('assignedTo')
      .populate('comments.user', 'name email');

    if (!ticket) {
      return res.status(404).json({ success: false, message: 'Ticket not found' });
    }

    res.status(200).json({ success: true, data: ticket });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const createTicket = async (req, res) => {
  try {
    const employee = await Employee.findOne({ userId: req.user.id });
    if (!employee) {
      return res.status(404).json({ success: false, message: 'Employee not found' });
    }

    const count = await Ticket.countDocuments();
    const ticketId = `TKT-${String(count + 1).padStart(5, '0')}`;

    const ticket = await Ticket.create({
      ...req.body,
      ticketId,
      raisedBy: employee._id,
    });

    res.status(201).json({ success: true, data: ticket });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const updateTicketStatus = async (req, res) => {
  try {
    const { status } = req.body;

    const ticket = await Ticket.findByIdAndUpdate(
      req.params.id,
      { status, resolvedAt: status === 'resolved' ? Date.now() : undefined },
      { new: true }
    );

    if (!ticket) {
      return res.status(404).json({ success: false, message: 'Ticket not found' });
    }

    res.status(200).json({ success: true, data: ticket });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const addComment = async (req, res) => {
  try {
    const ticket = await Ticket.findById(req.params.id);
    if (!ticket) {
      return res.status(404).json({ success: false, message: 'Ticket not found' });
    }

    ticket.comments.push({
      user: req.user.id,
      text: req.body.text,
      createdAt: Date.now(),
    });
    await ticket.save();

    res.status(200).json({ success: true, data: ticket });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const assignTicket = async (req, res) => {
  try {
    const { assignedTo } = req.body;

    const ticket = await Ticket.findByIdAndUpdate(
      req.params.id,
      { assignedTo, status: 'assigned' },
      { new: true }
    );

    if (!ticket) {
      return res.status(404).json({ success: false, message: 'Ticket not found' });
    }

    res.status(200).json({ success: true, data: ticket });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const getMyTickets = async (req, res) => {
  try {
    const employee = await Employee.findOne({ userId: req.user.id });
    if (!employee) {
      return res.status(404).json({ success: false, message: 'Employee not found' });
    }

    const tickets = await Ticket.find({ raisedBy: employee._id }).sort('-createdAt');

    res.status(200).json({ success: true, data: tickets });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
