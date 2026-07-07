import LeaveType from '../models/LeaveType.js';

export const getLeaveTypes = async (req, res) => {
  try {
    const leaveTypes = await LeaveType.find({ isActive: true });
    res.status(200).json({ success: true, data: leaveTypes });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const createLeaveType = async (req, res) => {
  try {
    const leaveType = await LeaveType.create(req.body);
    res.status(201).json({ success: true, data: leaveType });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const updateLeaveType = async (req, res) => {
  try {
    const leaveType = await LeaveType.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
    if (!leaveType) return res.status(404).json({ success: false, message: 'Leave type not found' });
    res.status(200).json({ success: true, data: leaveType });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const deleteLeaveType = async (req, res) => {
  try {
    const leaveType = await LeaveType.findByIdAndUpdate(req.params.id, { isActive: false }, { new: true });
    if (!leaveType) return res.status(404).json({ success: false, message: 'Leave type not found' });
    res.status(200).json({ success: true, message: 'Leave type deactivated' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
