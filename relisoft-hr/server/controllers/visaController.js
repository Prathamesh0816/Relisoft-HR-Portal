import { VisaApplication, PassportDetail } from '../models/Visa.js';
import Employee from '../models/Employee.js';

export const getApplications = async (req, res) => {
  try {
    const { status, country, page = 1, limit = 10 } = req.query;
    const query = {};
    if (status) query.status = status;
    if (country) query.country = country;

    const applications = await VisaApplication.find(query)
      .populate('employee', 'firstName lastName employeeId')
      .populate('createdBy', 'firstName lastName')
      .skip((page - 1) * limit)
      .limit(Number(limit))
      .sort('-createdAt');

    const total = await VisaApplication.countDocuments(query);

    res.status(200).json({
      success: true,
      data: applications,
      pagination: { page: Number(page), limit: Number(limit), total, pages: Math.ceil(total / limit) },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const createApplication = async (req, res) => {
  try {
    const employee = await Employee.findOne({ userId: req.user.id });
    if (!employee) return res.status(404).json({ success: false, message: 'Employee not found' });

    const application = await VisaApplication.create({
      ...req.body,
      employee: employee._id,
      createdBy: employee._id,
    });

    res.status(201).json({ success: true, data: application });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const getApplication = async (req, res) => {
  try {
    const application = await VisaApplication.findById(req.params.id)
      .populate('employee', 'firstName lastName employeeId')
      .populate('createdBy', 'firstName lastName');
    if (!application) return res.status(404).json({ success: false, message: 'Application not found' });
    res.status(200).json({ success: true, data: application });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const updateApplication = async (req, res) => {
  try {
    const application = await VisaApplication.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
    if (!application) return res.status(404).json({ success: false, message: 'Application not found' });
    res.status(200).json({ success: true, data: application });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const updateApplicationStatus = async (req, res) => {
  try {
    const { status, rejectionReason } = req.body;
    const update = { status };
    if (status === 'submitted') update.submittedAt = Date.now();
    if (status === 'rejected') update.rejectionReason = rejectionReason;
    if (status === 'approved') update.decisionDate = Date.now();

    const application = await VisaApplication.findByIdAndUpdate(req.params.id, update, { new: true });
    if (!application) return res.status(404).json({ success: false, message: 'Application not found' });
    res.status(200).json({ success: true, data: application });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const uploadDocument = async (req, res) => {
  try {
    const application = await VisaApplication.findById(req.params.id);
    if (!application) return res.status(404).json({ success: false, message: 'Application not found' });

    application.documents.push(req.body);
    await application.save();

    res.status(200).json({ success: true, data: application });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const getPassports = async (req, res) => {
  try {
    const passports = await PassportDetail.find().populate('employee', 'firstName lastName employeeId').sort('-createdAt');
    res.status(200).json({ success: true, data: passports });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const createPassport = async (req, res) => {
  try {
    const employee = await Employee.findOne({ userId: req.user.id });
    if (!employee) return res.status(404).json({ success: false, message: 'Employee not found' });

    const passport = await PassportDetail.create({ ...req.body, employee: employee._id });
    res.status(201).json({ success: true, data: passport });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const updatePassport = async (req, res) => {
  try {
    const passport = await PassportDetail.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
    if (!passport) return res.status(404).json({ success: false, message: 'Passport not found' });
    res.status(200).json({ success: true, data: passport });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const getExpiryAlerts = async (req, res) => {
  try {
    const thirtyDaysFromNow = new Date();
    thirtyDaysFromNow.setDate(thirtyDaysFromNow.getDate() + 90);

    const expiringPassports = await PassportDetail.find({
      expiryDate: { $lte: thirtyDaysFromNow, $gte: new Date() },
    }).populate('employee', 'firstName lastName employeeId');

    const expiringVisas = await VisaApplication.find({
      validUntil: { $lte: thirtyDaysFromNow, $gte: new Date() },
      status: 'approved',
    }).populate('employee', 'firstName lastName employeeId');

    res.status(200).json({ success: true, data: { expiringPassports, expiringVisas } });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
