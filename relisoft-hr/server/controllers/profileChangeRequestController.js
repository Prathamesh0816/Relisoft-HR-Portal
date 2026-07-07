import ProfileChangeRequest from '../models/ProfileChangeRequest.js';
import Employee from '../models/Employee.js';

export const getProfileChangeRequests = async (req, res) => {
  try {
    const { page = 1, limit = 10, status, section } = req.query;
    const query = {};
    if (status) query.status = status;
    if (section) query.section = section;

    const requests = await ProfileChangeRequest.find(query)
      .populate('employee', 'firstName lastName employeeId')
      .populate('reviewedBy', 'firstName lastName')
      .skip((page - 1) * limit)
      .limit(Number(limit))
      .sort('-createdAt');

    const total = await ProfileChangeRequest.countDocuments(query);

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

export const getProfileChangeRequest = async (req, res) => {
  try {
    const request = await ProfileChangeRequest.findById(req.params.id)
      .populate('employee')
      .populate('reviewedBy');
    if (!request) {
      return res.status(404).json({ success: false, message: 'Profile change request not found' });
    }
    res.status(200).json({ success: true, data: request });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const createProfileChangeRequest = async (req, res) => {
  try {
    const employee = await Employee.findOne({ userId: req.user.id });
    if (!employee) {
      return res.status(404).json({ success: false, message: 'Employee not found' });
    }

    const changeRequest = await ProfileChangeRequest.create({
      ...req.body,
      employee: employee._id,
    });
    res.status(201).json({ success: true, data: changeRequest });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const updateProfileChangeRequest = async (req, res) => {
  try {
    const request = await ProfileChangeRequest.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });
    if (!request) {
      return res.status(404).json({ success: false, message: 'Profile change request not found' });
    }
    res.status(200).json({ success: true, data: request });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const deleteProfileChangeRequest = async (req, res) => {
  try {
    const request = await ProfileChangeRequest.findByIdAndDelete(req.params.id);
    if (!request) {
      return res.status(404).json({ success: false, message: 'Profile change request not found' });
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

    const requests = await ProfileChangeRequest.find(query)
      .skip((page - 1) * limit)
      .limit(Number(limit))
      .sort('-createdAt');

    const total = await ProfileChangeRequest.countDocuments(query);

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

export const approve = async (req, res) => {
  try {
    const employee = await Employee.findOne({ userId: req.user.id });
    if (!employee) {
      return res.status(404).json({ success: false, message: 'Employee not found' });
    }

    const request = await ProfileChangeRequest.findByIdAndUpdate(
      req.params.id,
      {
        status: 'approved',
        reviewedBy: employee._id,
        reviewedAt: Date.now(),
        reviewerNotes: req.body.reviewerNotes,
      },
      { new: true }
    );

    if (!request) {
      return res.status(404).json({ success: false, message: 'Profile change request not found' });
    }

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

    const request = await ProfileChangeRequest.findByIdAndUpdate(
      req.params.id,
      {
        status: 'rejected',
        reviewedBy: employee._id,
        reviewedAt: Date.now(),
        reviewerNotes: req.body.reviewerNotes,
      },
      { new: true }
    );

    if (!request) {
      return res.status(404).json({ success: false, message: 'Profile change request not found' });
    }

    res.status(200).json({ success: true, data: request });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
