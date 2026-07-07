import Shift from '../models/Shift.js';
import Employee from '../models/Employee.js';

export const getShifts = async (req, res) => {
  try {
    const shifts = await Shift.find().sort('-createdAt');
    res.status(200).json({ success: true, data: shifts });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const getShift = async (req, res) => {
  try {
    const shift = await Shift.findById(req.params.id);
    if (!shift) {
      return res.status(404).json({ success: false, message: 'Shift not found' });
    }
    res.status(200).json({ success: true, data: shift });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const createShift = async (req, res) => {
  try {
    const shift = await Shift.create(req.body);
    res.status(201).json({ success: true, data: shift });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const updateShift = async (req, res) => {
  try {
    const shift = await Shift.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });

    if (!shift) {
      return res.status(404).json({ success: false, message: 'Shift not found' });
    }

    res.status(200).json({ success: true, data: shift });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const deleteShift = async (req, res) => {
  try {
    const shift = await Shift.findByIdAndDelete(req.params.id);
    if (!shift) {
      return res.status(404).json({ success: false, message: 'Shift not found' });
    }
    res.status(200).json({ success: true, message: 'Shift deleted' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const assignShift = async (req, res) => {
  try {
    const { employeeIds, shiftId, startDate, endDate } = req.body;

    const shift = await Shift.findById(shiftId);
    if (!shift) {
      return res.status(404).json({ success: false, message: 'Shift not found' });
    }

    await Employee.updateMany(
      { _id: { $in: employeeIds } },
      {
        $set: {
          shift: shiftId,
          shiftStartDate: startDate,
          shiftEndDate: endDate,
        },
      }
    );

    res.status(200).json({ success: true, message: 'Shift assigned successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const getMyShift = async (req, res) => {
  try {
    const employee = await Employee.findOne({ userId: req.user.id }).populate('shift');
    if (!employee) {
      return res.status(404).json({ success: false, message: 'Employee not found' });
    }

    res.status(200).json({ success: true, data: employee.shift });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const swapShiftRequest = async (req, res) => {
  try {
    const { targetEmployeeId, shiftDate, reason } = req.body;

    const employee = await Employee.findOne({ userId: req.user.id });
    if (!employee) {
      return res.status(404).json({ success: false, message: 'Employee not found' });
    }

    const swapRequest = {
      fromEmployee: employee._id,
      toEmployee: targetEmployeeId,
      shiftDate,
      reason,
      status: 'pending',
    };

    res.status(201).json({ success: true, data: swapRequest });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
