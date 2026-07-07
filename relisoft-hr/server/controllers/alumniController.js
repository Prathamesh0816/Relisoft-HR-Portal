import Alumni from '../models/Alumni.js';
import Employee from '../models/Employee.js';

export const getAlumni = async (req, res) => {
  try {
    const { page = 1, limit = 20, status, department, search } = req.query;
    const query = {};
    if (status) query.status = status;
    if (department) query.lastDepartment = department;
    if (search) {
      query.$or = [
        { firstName: { $regex: search, $options: 'i' } },
        { lastName: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
        { currentCompany: { $regex: search, $options: 'i' } },
      ];
    }

    const alumni = await Alumni.find(query)
      .populate('employee', 'firstName lastName employeeId')
      .skip((page - 1) * limit)
      .limit(Number(limit))
      .sort('-createdAt');

    const total = await Alumni.countDocuments(query);

    res.status(200).json({
      success: true,
      data: alumni,
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

export const getAlumniByEmployee = async (req, res) => {
  try {
    const alumni = await Alumni.findById(req.params.id).populate('employee');
    if (!alumni) {
      return res.status(404).json({ success: false, message: 'Alumni record not found' });
    }
    res.status(200).json({ success: true, data: alumni });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const createAlumni = async (req, res) => {
  try {
    const alumni = await Alumni.create(req.body);
    res.status(201).json({ success: true, data: alumni });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const updateAlumni = async (req, res) => {
  try {
    const alumni = await Alumni.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });
    if (!alumni) {
      return res.status(404).json({ success: false, message: 'Alumni record not found' });
    }
    res.status(200).json({ success: true, data: alumni });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const getAlumniStats = async (req, res) => {
  try {
    const total = await Alumni.countDocuments();
    const active = await Alumni.countDocuments({ status: 'active' });
    const willingToRejoin = await Alumni.countDocuments({ willingToRejoin: true });
    const departmentBreakdown = await Alumni.aggregate([
      { $group: { _id: '$lastDepartment', count: { $sum: 1 } } },
    ]);

    res.status(200).json({
      success: true,
      data: {
        total,
        active,
        willingToRejoin,
        departmentBreakdown,
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
