import User from '../models/User.js';
import Employee from '../models/Employee.js';
import { validateEmailDomain } from '../middleware/validateDomain.js';
import { ROLES, getRoleByValue, getRoleLabel, isApproverRole } from '../utils/roleEnums.js';

const generateTokenResponse = (user, employee) => {
  const token = user.generateToken();
  const roleInfo = getRoleByValue(user.roleValue);
  const canApprove = isApproverRole(user.roleValue);
  return {
    _id: user._id,
    name: user.name,
    email: user.email,
    role: user.role,
    roleValue: user.roleValue,
    roleLabel: roleInfo?.label || user.role,
    employeeId: user.employeeId || employee?.employeeCode,
    employeeDbId: employee?._id,
    department: user.department,
    designation: user.designation,
    avatar: user.avatar,
    username: user.username,
    canApprove,
    token,
  };
};

export const registerUser = async (req, res) => {
  try {
    const { name, email, password, role, roleValue, username } = req.body;

    const domainCheck = validateEmailDomain(email);
    if (!domainCheck.valid) {
      return res.status(403).json({ success: false, message: domainCheck.message });
    }

    if (role && role !== 'employee' && role !== 'superadmin') {
      const requester = req.user;
      if (!requester || !['superadmin', 'admin'].includes(requester.role)) {
        return res.status(403).json({ success: false, message: 'Only superadmin/admin can register non-employee roles' });
      }
    }

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ success: false, message: 'User already exists' });
    }

    const roleInfo = getRoleByValue(roleValue);
    const user = await User.create({
      name,
      email,
      password,
      role: roleInfo?.baseRole || role || 'employee',
      roleValue: roleValue || 1,
      employeeId: `RS${Date.now().toString(36).toUpperCase()}`,
      username: username || email.split('@')[0],
    });

    res.status(201).json({
      success: true,
      data: generateTokenResponse(user),
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;

    let user;
    if (email && email.includes('@')) {
      if (!validateEmailDomain(email).valid) {
        return res.status(403).json({ success: false, message: 'Email must be a @relisofttechnologies.com address' });
      }
      user = await User.findOne({ email }).select('+password');
    } else {
      user = await User.findOne({ username: email }).select('+password');
    }

    if (!user) {
      return res.status(401).json({ success: false, message: 'Invalid credentials' });
    }

    if (user.status !== 'active') {
      return res.status(401).json({ success: false, message: 'Account is not active. Contact administrator.' });
    }

    const isMatch = await user.matchPassword(password);
    if (!isMatch) {
      return res.status(401).json({ success: false, message: 'Invalid credentials' });
    }

    user.lastLogin = new Date();
    await user.save();

    const employee = await Employee.findOne({ userId: user._id });

    res.status(200).json({
      success: true,
      data: generateTokenResponse(user, employee),
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const getMe = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }
    const employee = await Employee.findOne({ userId: user._id });
    const roleInfo = getRoleByValue(user.roleValue);
    res.status(200).json({
      success: true,
      data: {
        ...user.toObject(),
        roleLabel: roleInfo?.label || user.role,
        employeeId: employee?.employeeCode || user.employeeId,
        employeeDbId: employee?._id,
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const updatePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;

    const user = await User.findById(req.user.id).select('+password');
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    const isMatch = await user.matchPassword(currentPassword);
    if (!isMatch) {
      return res.status(401).json({ success: false, message: 'Current password is incorrect' });
    }

    user.password = newPassword;
    await user.save();

    res.status(200).json({ success: true, message: 'Password updated successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    const resetToken = user.generateResetToken();
    await user.save({ validateBeforeSave: false });

    console.log(`Reset token for ${email}: ${resetToken}`);

    res.status(200).json({ success: true, message: 'Password reset email sent', resetToken });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const resetPassword = async (req, res) => {
  try {
    const { token, password } = req.body;

    const user = await User.findOne({
      resetPasswordToken: token,
      resetPasswordExpire: { $gt: Date.now() },
    });

    if (!user) {
      return res.status(400).json({ success: false, message: 'Invalid or expired token' });
    }

    user.password = password;
    user.resetPasswordToken = undefined;
    user.resetPasswordExpire = undefined;
    await user.save();

    res.status(200).json({ success: true, message: 'Password reset successful' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
