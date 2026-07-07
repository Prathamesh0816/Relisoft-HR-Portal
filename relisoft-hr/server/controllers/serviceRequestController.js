import ServiceRequest from '../models/ServiceRequest.js';
import Employee from '../models/Employee.js';

export const getServiceRequests = async (req, res) => {
  try {
    const { page = 1, limit = 10, status, priority, serviceItem, employee } = req.query;
    const query = {};
    if (status) query.status = status;
    if (priority) query.priority = priority;
    if (serviceItem) query.serviceItem = serviceItem;
    if (employee) query.employee = employee;

    const requests = await ServiceRequest.find(query)
      .populate('serviceItem', 'name type')
      .populate('employee', 'firstName lastName employeeId')
      .populate('assignedTo', 'firstName lastName')
      .populate('approvalChain.approver', 'firstName lastName')
      .populate('comments.user', 'firstName lastName')
      .skip((page - 1) * limit)
      .limit(Number(limit))
      .sort('-createdAt');

    const total = await ServiceRequest.countDocuments(query);

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

export const getServiceRequest = async (req, res) => {
  try {
    const request = await ServiceRequest.findById(req.params.id)
      .populate('serviceItem')
      .populate('employee')
      .populate('assignedTo')
      .populate('approvalChain.approver')
      .populate('comments.user');
    if (!request) {
      return res.status(404).json({ success: false, message: 'Service request not found' });
    }
    res.status(200).json({ success: true, data: request });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const createServiceRequest = async (req, res) => {
  try {
    const employee = await Employee.findOne({ userId: req.user.id });
    if (!employee) {
      return res.status(404).json({ success: false, message: 'Employee not found' });
    }

    const request = await ServiceRequest.create({
      ...req.body,
      employee: employee._id,
    });
    res.status(201).json({ success: true, data: request });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const updateServiceRequest = async (req, res) => {
  try {
    const request = await ServiceRequest.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });
    if (!request) {
      return res.status(404).json({ success: false, message: 'Service request not found' });
    }
    res.status(200).json({ success: true, data: request });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const deleteServiceRequest = async (req, res) => {
  try {
    const request = await ServiceRequest.findByIdAndDelete(req.params.id);
    if (!request) {
      return res.status(404).json({ success: false, message: 'Service request not found' });
    }
    res.status(200).json({ success: true, data: {} });
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

    const { page = 1, limit = 10, status } = req.query;
    const query = { employee: employee._id };
    if (status) query.status = status;

    const requests = await ServiceRequest.find(query)
      .populate('serviceItem', 'name type')
      .populate('assignedTo', 'firstName lastName')
      .skip((page - 1) * limit)
      .limit(Number(limit))
      .sort('-createdAt');

    const total = await ServiceRequest.countDocuments(query);

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

export const submitForApproval = async (req, res) => {
  try {
    const request = await ServiceRequest.findById(req.params.id);
    if (!request) {
      return res.status(404).json({ success: false, message: 'Service request not found' });
    }
    request.status = 'pending_approval';
    await request.save();
    res.status(200).json({ success: true, data: request });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const approve = async (req, res) => {
  try {
    const employee = await Employee.findOne({ userId: req.user.id });
    if (!employee) {
      return res.status(404).json({ success: false, message: 'Employee not found' });
    }

    const request = await ServiceRequest.findById(req.params.id);
    if (!request) {
      return res.status(404).json({ success: false, message: 'Service request not found' });
    }

    const approvalIndex = request.approvalChain.findIndex(
      (a) => a.approver.toString() === employee._id.toString() && a.status === 'pending'
    );

    if (approvalIndex > -1) {
      request.approvalChain[approvalIndex].status = 'approved';
      request.approvalChain[approvalIndex].decidedAt = Date.now();
      request.approvalChain[approvalIndex].comment = req.body.comment || '';
    }

    const allApproved = request.approvalChain.every((a) => a.status === 'approved');
    if (allApproved || request.approvalChain.length === 0) {
      request.status = 'approved';
    }

    await request.save();
    res.status(200).json({ success: true, data: request });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const reject = async (req, res) => {
  try {
    const employee = await Employee.findOne({ userId: req.user.id });
    if (!employee) {
      return res.status(404).json({ success: false, message: 'Employee not found' });
    }

    const request = await ServiceRequest.findById(req.params.id);
    if (!request) {
      return res.status(404).json({ success: false, message: 'Service request not found' });
    }

    request.status = 'rejected';
    const approvalIndex = request.approvalChain.findIndex(
      (a) => a.approver.toString() === employee._id.toString() && a.status === 'pending'
    );
    if (approvalIndex > -1) {
      request.approvalChain[approvalIndex].status = 'rejected';
      request.approvalChain[approvalIndex].decidedAt = Date.now();
      request.approvalChain[approvalIndex].comment = req.body.comment || '';
    }

    await request.save();
    res.status(200).json({ success: true, data: request });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const fulfill = async (req, res) => {
  try {
    const request = await ServiceRequest.findById(req.params.id);
    if (!request) {
      return res.status(404).json({ success: false, message: 'Service request not found' });
    }
    request.status = 'fulfilled';
    request.fulfilledAt = Date.now();
    await request.save();
    res.status(200).json({ success: true, data: request });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const cancel = async (req, res) => {
  try {
    const request = await ServiceRequest.findById(req.params.id);
    if (!request) {
      return res.status(404).json({ success: false, message: 'Service request not found' });
    }
    request.status = 'cancelled';
    await request.save();
    res.status(200).json({ success: true, data: request });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const addComment = async (req, res) => {
  try {
    const employee = await Employee.findOne({ userId: req.user.id });
    if (!employee) {
      return res.status(404).json({ success: false, message: 'Employee not found' });
    }

    const request = await ServiceRequest.findById(req.params.id);
    if (!request) {
      return res.status(404).json({ success: false, message: 'Service request not found' });
    }

    request.comments.push({
      user: employee._id,
      text: req.body.text,
      attachment: req.body.attachment,
      createdAt: Date.now(),
    });
    await request.save();

    res.status(200).json({ success: true, data: request });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const checkSLA = async (req, res) => {
  try {
    const request = await ServiceRequest.findById(req.params.id).populate('serviceItem', 'slaHours');
    if (!request) {
      return res.status(404).json({ success: false, message: 'Service request not found' });
    }

    const slaHours = request.serviceItem?.slaHours || 24;
    const slaDeadline = new Date(request.createdAt);
    slaDeadline.setHours(slaDeadline.getHours() + slaHours);

    const now = new Date();
    const isBreached = now > slaDeadline;
    const remainingMs = slaDeadline - now;

    res.status(200).json({
      success: true,
      data: {
        slaDeadline,
        slaHours,
        isBreached,
        remainingHours: Math.max(0, remainingMs / (1000 * 60 * 60)),
        status: request.status,
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
