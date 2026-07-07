import InternalJobPosting from '../models/InternalJobPosting.js';
import InternalApplication from '../models/InternalApplication.js';
import Employee from '../models/Employee.js';

export const createPosting = async (req, res) => {
  try {
    const employee = await Employee.findOne({ userId: req.user.id });
    if (!employee) return res.status(404).json({ success: false, message: 'Employee not found' });

    const posting = await InternalJobPosting.create({ ...req.body, postedBy: employee._id });
    res.status(201).json({ success: true, data: posting });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const getPostings = async (req, res) => {
  try {
    const { department, status } = req.query;
    const query = {};
    if (!status) query.status = 'Open';
    else query.status = status;
    if (department) query.department = department;

    const postings = await InternalJobPosting.find(query).populate('postedBy', 'firstName lastName').sort('-createdAt');
    res.status(200).json({ success: true, data: postings });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const getPosting = async (req, res) => {
  try {
    const posting = await InternalJobPosting.findById(req.params.id).populate('postedBy', 'firstName lastName');
    if (!posting) return res.status(404).json({ success: false, message: 'Posting not found' });
    res.status(200).json({ success: true, data: posting });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const updatePosting = async (req, res) => {
  try {
    const posting = await InternalJobPosting.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
    if (!posting) return res.status(404).json({ success: false, message: 'Posting not found' });
    res.status(200).json({ success: true, data: posting });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const deletePosting = async (req, res) => {
  try {
    const posting = await InternalJobPosting.findByIdAndDelete(req.params.id);
    if (!posting) return res.status(404).json({ success: false, message: 'Posting not found' });
    res.status(200).json({ success: true, data: {} });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const createApplication = async (req, res) => {
  try {
    const employee = await Employee.findOne({ userId: req.user.id });
    if (!employee) return res.status(404).json({ success: false, message: 'Employee not found' });

    const existing = await InternalApplication.findOne({ posting: req.body.posting, employee: employee._id });
    if (existing) return res.status(400).json({ success: false, message: 'You have already applied to this posting' });

    const application = await InternalApplication.create({ ...req.body, employee: employee._id });
    res.status(201).json({ success: true, data: application });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const getApplications = async (req, res) => {
  try {
    const { employeeId } = req.params;
    const applications = await InternalApplication.find({ employee: employeeId })
      .populate('posting', 'title department location')
      .populate('employee', 'firstName lastName employeeId')
      .populate('approvedBy', 'firstName lastName')
      .sort('-createdAt');
    res.status(200).json({ success: true, data: applications });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const updateApplicationStatus = async (req, res) => {
  try {
    const { status } = req.body;
    const application = await InternalApplication.findByIdAndUpdate(
      req.params.id,
      { status },
      { new: true, runValidators: true }
    );
    if (!application) return res.status(404).json({ success: false, message: 'Application not found' });
    res.status(200).json({ success: true, data: application });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
