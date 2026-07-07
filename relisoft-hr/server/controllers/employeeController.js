import Employee from '../models/Employee.js';
import User from '../models/User.js';

export const getEmployees = async (req, res) => {
  try {
    const { page = 1, limit = 10, department, status } = req.query;
    const query = {};
    if (department) query.department = department;
    if (status) query.status = status;

    const employees = await Employee.find(query)
      .populate('reportingTo', 'name email')
      .populate('userId', 'name email')
      .skip((page - 1) * limit)
      .limit(Number(limit))
      .sort('-createdAt');

    const total = await Employee.countDocuments(query);

    res.status(200).json({
      success: true,
      data: employees,
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

export const getEmployee = async (req, res) => {
  try {
    const employee = await Employee.findById(req.params.id)
      .populate('reportingTo')
      .populate('userId', 'name email role')
      .populate('department')
      .populate('designation');

    if (!employee) {
      return res.status(404).json({ success: false, message: 'Employee not found' });
    }

    res.status(200).json({ success: true, data: employee });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const createEmployee = async (req, res) => {
  try {
    const { email, password, name, ...employeeData } = req.body;

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ success: false, message: 'User with this email already exists' });
    }

    const user = await User.create({ name, email, password, role: 'employee' });

    const employee = await Employee.create({
      ...employeeData,
      userId: user._id,
    });

    res.status(201).json({ success: true, data: employee });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const updateEmployee = async (req, res) => {
  try {
    const employee = await Employee.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });

    if (!employee) {
      return res.status(404).json({ success: false, message: 'Employee not found' });
    }

    res.status(200).json({ success: true, data: employee });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const deleteEmployee = async (req, res) => {
  try {
    const employee = await Employee.findByIdAndUpdate(
      req.params.id,
      { status: 'inactive' },
      { new: true }
    );

    if (!employee) {
      return res.status(404).json({ success: false, message: 'Employee not found' });
    }

    res.status(200).json({ success: true, message: 'Employee deactivated' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const getEmployeeProfile = async (req, res) => {
  try {
    const employee = await Employee.findOne({ userId: req.user.id })
      .populate('reportingTo')
      .populate('department')
      .populate('designation');

    if (!employee) {
      return res.status(404).json({ success: false, message: 'Employee profile not found' });
    }

    res.status(200).json({ success: true, data: employee });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const updateProfileImage = async (req, res) => {
  try {
    const employee = await Employee.findOne({ userId: req.user.id });
    if (!employee) {
      return res.status(404).json({ success: false, message: 'Employee not found' });
    }

    employee.profileImage = req.file ? req.file.path : req.body.imageUrl;
    await employee.save();

    res.status(200).json({ success: true, data: employee });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const getReportingHierarchy = async (req, res) => {
  try {
    const hierarchy = [];
    let current = await Employee.findById(req.params.id);

    while (current && current.reportingTo) {
      const manager = await Employee.findById(current.reportingTo).populate('userId', 'name');
      if (manager) {
        hierarchy.push(manager);
        current = manager;
      } else {
        break;
      }
    }

    res.status(200).json({ success: true, data: hierarchy });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
