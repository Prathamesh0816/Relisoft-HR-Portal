import Visitor from '../models/Visitor.js';
import Visit from '../models/Visit.js';
import Employee from '../models/Employee.js';

export const registerVisitor = async (req, res) => {
  try {
    const visitor = await Visitor.create(req.body);
    res.status(201).json({ success: true, data: visitor });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const getVisitors = async (req, res) => {
  try {
    const { isBlacklisted } = req.query;
    const query = {};
    if (isBlacklisted !== undefined) query.isBlacklisted = isBlacklisted === 'true';

    const visitors = await Visitor.find(query).sort('-createdAt');
    res.status(200).json({ success: true, data: visitors });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const updateVisitor = async (req, res) => {
  try {
    const visitor = await Visitor.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
    if (!visitor) return res.status(404).json({ success: false, message: 'Visitor not found' });
    res.status(200).json({ success: true, data: visitor });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const scheduleVisit = async (req, res) => {
  try {
    const employee = await Employee.findOne({ userId: req.user.id });
    const visit = await Visit.create({ ...req.body, host: employee?._id || req.body.host });
    res.status(201).json({ success: true, data: visit });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const getPendingVisits = async (req, res) => {
  try {
    const { host } = req.query;
    const query = { status: 'Pending' };
    if (host) query.host = host;

    const visits = await Visit.find(query)
      .populate('visitor', 'firstName lastName company email phone')
      .populate('host', 'firstName lastName')
      .sort('-expectedDate');
    res.status(200).json({ success: true, data: visits });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const approveVisit = async (req, res) => {
  try {
    const { approved, notes } = req.body;
    const employee = await Employee.findOne({ userId: req.user.id });

    const update = {
      status: approved ? 'Approved' : 'Cancelled',
      approvedBy: employee?._id,
      notes,
    };

    if (approved) {
      const gatePassNumber = `VP-${String(Math.floor(Math.random() * 100000)).padStart(5, '0')}`;
      update.gatePassNumber = gatePassNumber;
    }

    const visit = await Visit.findByIdAndUpdate(req.params.id, update, { new: true });
    if (!visit) return res.status(404).json({ success: false, message: 'Visit not found' });
    res.status(200).json({ success: true, data: visit });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const checkIn = async (req, res) => {
  try {
    const visit = await Visit.findByIdAndUpdate(
      req.params.id,
      { status: 'CheckedIn', checkedInAt: Date.now() },
      { new: true }
    );
    if (!visit) return res.status(404).json({ success: false, message: 'Visit not found' });
    res.status(200).json({ success: true, data: visit });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const checkOut = async (req, res) => {
  try {
    const visit = await Visit.findByIdAndUpdate(
      req.params.id,
      { status: 'CheckedOut', checkedOutAt: Date.now() },
      { new: true }
    );
    if (!visit) return res.status(404).json({ success: false, message: 'Visit not found' });
    res.status(200).json({ success: true, data: visit });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const getVisitHistory = async (req, res) => {
  try {
    const { visitorId } = req.params;
    const visits = await Visit.find({ visitor: visitorId })
      .populate('visitor', 'firstName lastName company')
      .populate('host', 'firstName lastName')
      .populate('approvedBy', 'firstName lastName')
      .sort('-expectedDate');
    res.status(200).json({ success: true, data: visits });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
