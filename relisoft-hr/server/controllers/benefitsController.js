import BenefitPlan from '../models/BenefitPlan.js';
import EmployeeBenefit from '../models/EmployeeBenefit.js';
import Employee from '../models/Employee.js';

export const getPlans = async (req, res) => {
  try {
    const { type, status } = req.query;
    const query = {};
    if (type) query.type = type;
    if (status === 'active') query.isActive = true;
    else if (status === 'inactive') query.isActive = false;

    const plans = await BenefitPlan.find(query).sort('-createdAt');
    res.status(200).json({ success: true, data: plans });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const createPlan = async (req, res) => {
  try {
    const plan = await BenefitPlan.create(req.body);
    res.status(201).json({ success: true, data: plan });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const updatePlan = async (req, res) => {
  try {
    const plan = await BenefitPlan.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
    if (!plan) return res.status(404).json({ success: false, message: 'Plan not found' });
    res.status(200).json({ success: true, data: plan });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const enrollBenefit = async (req, res) => {
  try {
    const { employeeId, planId } = req.body;

    const existing = await EmployeeBenefit.findOne({ employee: employeeId, plan: planId });
    if (existing) return res.status(400).json({ success: false, message: 'Employee is already enrolled in this plan' });

    const enrollment = await EmployeeBenefit.create({ employee: employeeId, plan: planId, status: 'Enrolled' });
    res.status(201).json({ success: true, data: enrollment });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const getMyBenefits = async (req, res) => {
  try {
    const { employee } = req.query;
    const benefits = await EmployeeBenefit.find({ employee })
      .populate('plan')
      .populate('employee', 'firstName lastName employeeId')
      .sort('-enrolledAt');
    res.status(200).json({ success: true, data: benefits });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const getEnrolledEmployees = async (req, res) => {
  try {
    const { planId } = req.params;
    const enrollments = await EmployeeBenefit.find({ plan: planId })
      .populate('employee', 'firstName lastName employeeId department')
      .sort('-enrolledAt');
    res.status(200).json({ success: true, data: enrollments });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const addDependent = async (req, res) => {
  try {
    const { employeeId, planId, dependent } = req.body;

    const enrollment = await EmployeeBenefit.findOne({ employee: employeeId, plan: planId });
    if (!enrollment) return res.status(404).json({ success: false, message: 'Enrollment not found' });

    enrollment.dependents.push(dependent);
    await enrollment.save();

    res.status(200).json({ success: true, data: enrollment });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const getDependents = async (req, res) => {
  try {
    const { employeeId } = req.params;
    const enrollments = await EmployeeBenefit.find({ employee: employeeId }).populate('plan', 'name type');
    const dependents = enrollments.flatMap(e => e.dependents.map(d => ({ ...d.toObject(), plan: e.plan })));
    res.status(200).json({ success: true, data: dependents });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
