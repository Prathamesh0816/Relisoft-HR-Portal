import ManpowerPlan from '../models/ManpowerPlan.js';
import HiringForecast from '../models/HiringForecast.js';

export const getPlans = async (req, res) => {
  try {
    const { fiscalYear, quarter, department } = req.query;
    const query = {};
    if (fiscalYear) query.fiscalYear = fiscalYear;
    if (quarter) query.quarter = quarter;
    if (department) query.department = department;

    const plans = await ManpowerPlan.find(query).sort('-fiscalYear');
    res.status(200).json({ success: true, data: plans });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const createPlan = async (req, res) => {
  try {
    const plan = await ManpowerPlan.create(req.body);
    res.status(201).json({ success: true, data: plan });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const updatePlan = async (req, res) => {
  try {
    const plan = await ManpowerPlan.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
    if (!plan) return res.status(404).json({ success: false, message: 'Plan not found' });
    res.status(200).json({ success: true, data: plan });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const deletePlan = async (req, res) => {
  try {
    const plan = await ManpowerPlan.findByIdAndDelete(req.params.id);
    if (!plan) return res.status(404).json({ success: false, message: 'Plan not found' });
    res.status(200).json({ success: true, data: {} });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const getForecasts = async (req, res) => {
  try {
    const { department } = req.query;
    const query = {};
    if (department) query.department = department;

    const forecasts = await HiringForecast.find(query).populate('createdBy', 'firstName lastName').sort('-createdAt');
    res.status(200).json({ success: true, data: forecasts });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const createForecast = async (req, res) => {
  try {
    const forecast = await HiringForecast.create(req.body);
    res.status(201).json({ success: true, data: forecast });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const updateForecast = async (req, res) => {
  try {
    const forecast = await HiringForecast.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
    if (!forecast) return res.status(404).json({ success: false, message: 'Forecast not found' });
    res.status(200).json({ success: true, data: forecast });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const getDashboard = async (req, res) => {
  try {
    const plans = await ManpowerPlan.find();

    const totals = plans.reduce((acc, p) => ({
      totalBudgetedHeadcount: acc.totalBudgetedHeadcount + p.budgetedHeadcount,
      totalActualHeadcount: acc.totalActualHeadcount + p.actualHeadcount,
      totalBudgetedCost: acc.totalBudgetedCost + p.budgetedCost,
      totalActualCost: acc.totalActualCost + p.actualCost,
      totalOpenPositions: acc.totalOpenPositions + p.openPositions,
    }), { totalBudgetedHeadcount: 0, totalActualHeadcount: 0, totalBudgetedCost: 0, totalActualCost: 0, totalOpenPositions: 0 });

    const departmentSummaries = plans.reduce((acc, p) => {
      if (!acc[p.department]) acc[p.department] = { budgetedHeadcount: 0, actualHeadcount: 0, budgetedCost: 0, actualCost: 0 };
      acc[p.department].budgetedHeadcount += p.budgetedHeadcount;
      acc[p.department].actualHeadcount += p.actualHeadcount;
      acc[p.department].budgetedCost += p.budgetedCost;
      acc[p.department].actualCost += p.actualCost;
      return acc;
    }, {});

    res.status(200).json({ success: true, data: { ...totals, departmentSummaries } });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const getGapAnalysis = async (req, res) => {
  try {
    const plans = await ManpowerPlan.find();

    const gapByDepartment = plans.map(p => ({
      department: p.department,
      fiscalYear: p.fiscalYear,
      budgetedHeadcount: p.budgetedHeadcount,
      actualHeadcount: p.actualHeadcount,
      gap: p.budgetedHeadcount - p.actualHeadcount,
      openPositions: p.openPositions,
    }));

    const totalOpenPositions = plans.reduce((sum, p) => sum + p.openPositions, 0);

    res.status(200).json({ success: true, data: { gapByDepartment, totalOpenPositions } });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
