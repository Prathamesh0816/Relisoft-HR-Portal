import Vendor from '../models/Vendor.js';
import Contractor from '../models/Contractor.js';
import TimeLog from '../models/TimeLog.js';

export const createVendor = async (req, res) => {
  try {
    const vendor = await Vendor.create(req.body);
    res.status(201).json({ success: true, data: vendor });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const getVendors = async (req, res) => {
  try {
    const { status } = req.query;
    const query = {};
    if (status) query.status = status;

    const vendors = await Vendor.find(query).sort('-createdAt');
    res.status(200).json({ success: true, data: vendors });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const updateVendor = async (req, res) => {
  try {
    const vendor = await Vendor.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
    if (!vendor) return res.status(404).json({ success: false, message: 'Vendor not found' });
    res.status(200).json({ success: true, data: vendor });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const createContractor = async (req, res) => {
  try {
    const contractor = await Contractor.create(req.body);
    res.status(201).json({ success: true, data: contractor });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const getContractors = async (req, res) => {
  try {
    const { status, department, vendor } = req.query;
    const query = {};
    if (status) query.status = status;
    if (department) query.department = department;
    if (vendor) query.vendor = vendor;

    const contractors = await Contractor.find(query)
      .populate('vendor', 'name email')
      .populate('reportingManager', 'firstName lastName')
      .sort('-createdAt');
    res.status(200).json({ success: true, data: contractors });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const getContractor = async (req, res) => {
  try {
    const contractor = await Contractor.findById(req.params.id)
      .populate('vendor', 'name email phone')
      .populate('reportingManager', 'firstName lastName email');
    if (!contractor) return res.status(404).json({ success: false, message: 'Contractor not found' });
    res.status(200).json({ success: true, data: contractor });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const updateContractor = async (req, res) => {
  try {
    const contractor = await Contractor.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
    if (!contractor) return res.status(404).json({ success: false, message: 'Contractor not found' });
    res.status(200).json({ success: true, data: contractor });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const logTime = async (req, res) => {
  try {
    const { id } = req.params;
    const timeLog = await TimeLog.create({ ...req.body, contractor: id });
    res.status(201).json({ success: true, data: timeLog });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const getTimeLogs = async (req, res) => {
  try {
    const { id } = req.params;
    const { startDate, endDate } = req.query;
    const query = { contractor: id };
    if (startDate || endDate) {
      query.date = {};
      if (startDate) query.date.$gte = new Date(startDate);
      if (endDate) query.date.$lte = new Date(endDate);
    }

    const timeLogs = await TimeLog.find(query).sort('-date');
    res.status(200).json({ success: true, data: timeLogs });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
