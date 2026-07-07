import PolicyAcknowledgment from '../models/PolicyAcknowledgment.js';
import Policy from '../models/Policy.js';
import Employee from '../models/Employee.js';

export const getPolicyAcknowledments = async (req, res) => {
  try {
    const { page = 1, limit = 10, status, policy, employee } = req.query;
    const query = {};
    if (status) query.status = status;
    if (policy) query.policy = policy;
    if (employee) query.employee = employee;

    const acknowledgments = await PolicyAcknowledgment.find(query)
      .populate('policy', 'title category version')
      .populate('employee', 'firstName lastName employeeId')
      .skip((page - 1) * limit)
      .limit(Number(limit))
      .sort('-createdAt');

    const total = await PolicyAcknowledgment.countDocuments(query);

    res.status(200).json({
      success: true,
      data: acknowledgments,
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

export const getPolicyAcknowledgment = async (req, res) => {
  try {
    const acknowledgment = await PolicyAcknowledgment.findById(req.params.id)
      .populate('policy')
      .populate('employee');
    if (!acknowledgment) {
      return res.status(404).json({ success: false, message: 'Policy acknowledgment not found' });
    }
    res.status(200).json({ success: true, data: acknowledgment });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const createPolicyAcknowledgment = async (req, res) => {
  try {
    const acknowledgment = await PolicyAcknowledgment.create(req.body);
    res.status(201).json({ success: true, data: acknowledgment });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const updatePolicyAcknowledgment = async (req, res) => {
  try {
    const acknowledgment = await PolicyAcknowledgment.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });
    if (!acknowledgment) {
      return res.status(404).json({ success: false, message: 'Policy acknowledgment not found' });
    }
    res.status(200).json({ success: true, data: acknowledgment });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const deletePolicyAcknowledgment = async (req, res) => {
  try {
    const acknowledgment = await PolicyAcknowledgment.findByIdAndDelete(req.params.id);
    if (!acknowledgment) {
      return res.status(404).json({ success: false, message: 'Policy acknowledgment not found' });
    }
    res.status(200).json({ success: true, data: {} });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const acknowledge = async (req, res) => {
  try {
    const employee = await Employee.findOne({ userId: req.user.id });
    if (!employee) {
      return res.status(404).json({ success: false, message: 'Employee not found' });
    }

    const { policyId } = req.params;
    const { status, ipAddress, userAgent } = req.body;

    const policy = await Policy.findById(policyId);
    if (!policy) {
      return res.status(404).json({ success: false, message: 'Policy not found' });
    }

    const acknowledgment = await PolicyAcknowledgment.findOneAndUpdate(
      { policy: policyId, employee: employee._id },
      {
        policy: policyId,
        employee: employee._id,
        status: status || 'acknowledged',
        acknowledgedAt: Date.now(),
        ipAddress,
        userAgent,
      },
      { upsert: true, new: true, runValidators: true }
    );

    res.status(200).json({ success: true, data: acknowledgment });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const getPendingForEmployee = async (req, res) => {
  try {
    const employee = await Employee.findOne({ userId: req.user.id });
    if (!employee) {
      return res.status(404).json({ success: false, message: 'Employee not found' });
    }

    const acknowledgedPolicyIds = await PolicyAcknowledgment.find({
      employee: employee._id,
      status: 'acknowledged',
    }).distinct('policy');

    const pendingPolicies = await Policy.find({
      _id: { $nin: acknowledgedPolicyIds },
      status: 'active',
      requiresAcknowledgment: true,
    });

    res.status(200).json({ success: true, data: pendingPolicies });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const getStats = async (req, res) => {
  try {
    const { policyId } = req.params;

    const total = await PolicyAcknowledgment.countDocuments({ policy: policyId });
    const acknowledged = await PolicyAcknowledgment.countDocuments({ policy: policyId, status: 'acknowledged' });
    const declined = await PolicyAcknowledgment.countDocuments({ policy: policyId, status: 'declined' });
    const pending = await PolicyAcknowledgment.countDocuments({ policy: policyId, status: 'pending' });

    const totalEmployees = await Employee.countDocuments({ status: 'active' });

    res.status(200).json({
      success: true,
      data: {
        total,
        acknowledged,
        declined,
        pending,
        pendingFromOthers: totalEmployees - total,
        acknowledgmentRate: totalEmployees > 0 ? Math.round((acknowledged / totalEmployees) * 100) : 0,
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
