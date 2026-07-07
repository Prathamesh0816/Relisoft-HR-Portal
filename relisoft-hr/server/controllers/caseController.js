import Case from '../models/Case.js';
import Employee from '../models/Employee.js';

export const createCase = async (req, res) => {
  try {
    const employee = await Employee.findOne({ userId: req.user.id });
    if (!employee) return res.status(404).json({ success: false, message: 'Employee not found' });

    const caseItem = await Case.create({ ...req.body, reportedBy: employee._id });
    res.status(201).json({ success: true, data: caseItem });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const getCases = async (req, res) => {
  try {
    const { status, type, severity, priority } = req.query;
    const query = {};
    if (status) query.status = status;
    if (type) query.type = type;
    if (severity) query.severity = severity;
    if (priority) query.priority = priority;

    const cases = await Case.find(query)
      .populate('reportedBy', 'firstName lastName employeeId')
      .populate('reportedEmployee', 'firstName lastName employeeId')
      .populate('assignedInvestigator', 'firstName lastName employeeId')
      .populate('resolvedBy', 'firstName lastName')
      .sort('-createdAt');
    res.status(200).json({ success: true, data: cases });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const getCase = async (req, res) => {
  try {
    const caseItem = await Case.findById(req.params.id)
      .populate('reportedBy', 'firstName lastName employeeId')
      .populate('reportedEmployee', 'firstName lastName employeeId')
      .populate('assignedInvestigator', 'firstName lastName employeeId')
      .populate('resolvedBy', 'firstName lastName')
      .populate('timeline.actor', 'firstName lastName');
    if (!caseItem) return res.status(404).json({ success: false, message: 'Case not found' });
    res.status(200).json({ success: true, data: caseItem });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const updateCase = async (req, res) => {
  try {
    const caseItem = await Case.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
    if (!caseItem) return res.status(404).json({ success: false, message: 'Case not found' });
    res.status(200).json({ success: true, data: caseItem });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const assignInvestigator = async (req, res) => {
  try {
    const { investigatorId } = req.body;
    const caseItem = await Case.findByIdAndUpdate(
      req.params.id,
      { assignedInvestigator: investigatorId, status: 'UnderInvestigation' },
      { new: true }
    ).populate('assignedInvestigator', 'firstName lastName');
    if (!caseItem) return res.status(404).json({ success: false, message: 'Case not found' });
    res.status(200).json({ success: true, data: caseItem });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const resolveCase = async (req, res) => {
  try {
    const employee = await Employee.findOne({ userId: req.user.id });
    if (!employee) return res.status(404).json({ success: false, message: 'Employee not found' });

    const { resolution, action } = req.body;
    const caseItem = await Case.findByIdAndUpdate(
      req.params.id,
      { resolution, action, status: 'Resolved', resolvedAt: Date.now(), resolvedBy: employee._id },
      { new: true }
    ).populate('resolvedBy', 'firstName lastName');
    if (!caseItem) return res.status(404).json({ success: false, message: 'Case not found' });
    res.status(200).json({ success: true, data: caseItem });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const addDocument = async (req, res) => {
  try {
    const caseItem = await Case.findById(req.params.id);
    if (!caseItem) return res.status(404).json({ success: false, message: 'Case not found' });

    caseItem.documents.push(req.body.document);
    await caseItem.save();

    res.status(200).json({ success: true, data: caseItem });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const addTimelineEntry = async (req, res) => {
  try {
    const employee = await Employee.findOne({ userId: req.user.id });
    const caseItem = await Case.findById(req.params.id);
    if (!caseItem) return res.status(404).json({ success: false, message: 'Case not found' });

    caseItem.timeline.push({
      action: req.body.action,
      actor: employee?._id,
      timestamp: Date.now(),
      details: req.body.details,
    });
    await caseItem.save();

    res.status(200).json({ success: true, data: caseItem });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
