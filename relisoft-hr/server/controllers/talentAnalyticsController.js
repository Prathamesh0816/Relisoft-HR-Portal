import TalentProfile from '../models/TalentProfile.js';
import TalentReview from '../models/TalentReview.js';
import Employee from '../models/Employee.js';

export const getMatrix = async (req, res) => {
  try {
    const profiles = await TalentProfile.find()
      .populate('employee', 'firstName lastName employeeId department designation')
      .sort('-performanceRating');
    res.status(200).json({ success: true, data: profiles });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const getSegments = async (req, res) => {
  try {
    const segments = await TalentProfile.aggregate([
      { $group: { _id: '$talentSegment', count: { $sum: 1 } } },
      { $sort: { count: -1 } },
    ]);
    res.status(200).json({ success: true, data: segments });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const getFlightRisk = async (req, res) => {
  try {
    const { severity } = req.query;
    const query = { flightRiskScore: { $exists: true } };
    if (severity === 'high') query.flightRiskScore = { $gte: 70 };
    else if (severity === 'medium') query.flightRiskScore = { $gte: 40, $lt: 70 };
    else if (severity === 'low') query.flightRiskScore = { $lt: 40 };

    const profiles = await TalentProfile.find(query)
      .populate('employee', 'firstName lastName employeeId department')
      .sort('-flightRiskScore');
    res.status(200).json({ success: true, data: profiles });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const getSuccession = async (req, res) => {
  try {
    const { successionReadiness } = req.query;
    const query = {};
    if (successionReadiness) query.successionReadiness = successionReadiness;

    const profiles = await TalentProfile.find(query)
      .populate('employee', 'firstName lastName employeeId department designation')
      .sort('-successionReadiness');
    res.status(200).json({ success: true, data: profiles });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const getBenchStrength = async (req, res) => {
  try {
    const benchStrength = await TalentProfile.aggregate([
      { $group: { _id: '$department', count: { $sum: 1 } } },
      { $sort: { count: -1 } },
    ]);

    const total = benchStrength.reduce((sum, d) => sum + d.count, 0);

    res.status(200).json({ success: true, data: { departments: benchStrength, total } });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const createReview = async (req, res) => {
  try {
    const employee = await Employee.findOne({ userId: req.user.id });
    if (!employee) return res.status(404).json({ success: false, message: 'Employee not found' });

    const review = await TalentReview.create({ ...req.body, facilitator: employee._id });
    res.status(201).json({ success: true, data: review });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const getReviews = async (req, res) => {
  try {
    const reviews = await TalentReview.find()
      .populate('participants', 'firstName lastName employeeId')
      .populate('facilitator', 'firstName lastName')
      .populate('decisions.employee', 'firstName lastName employeeId')
      .sort('-createdAt');
    res.status(200).json({ success: true, data: reviews });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const getReview = async (req, res) => {
  try {
    const review = await TalentReview.findById(req.params.id)
      .populate('participants', 'firstName lastName employeeId')
      .populate('facilitator', 'firstName lastName')
      .populate('decisions.employee', 'firstName lastName employeeId');
    if (!review) return res.status(404).json({ success: false, message: 'Review not found' });
    res.status(200).json({ success: true, data: review });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const updateReviewStatus = async (req, res) => {
  try {
    const { status } = req.body;
    const update = { status };
    if (status === 'Completed') update.completedAt = Date.now();

    const review = await TalentReview.findByIdAndUpdate(req.params.id, update, { new: true, runValidators: true });
    if (!review) return res.status(404).json({ success: false, message: 'Review not found' });
    res.status(200).json({ success: true, data: review });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const addReviewDecision = async (req, res) => {
  try {
    const review = await TalentReview.findById(req.params.id);
    if (!review) return res.status(404).json({ success: false, message: 'Review not found' });

    review.decisions.push(req.body);
    await review.save();

    res.status(200).json({ success: true, data: review });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
