import FormDefinition from '../models/FormDefinition.js';
import FormSubmission from '../models/FormSubmission.js';
import Employee from '../models/Employee.js';

export const createForm = async (req, res) => {
  try {
    const employee = await Employee.findOne({ userId: req.user.id });
    if (!employee) return res.status(404).json({ success: false, message: 'Employee not found' });

    const form = await FormDefinition.create({ ...req.body, createdBy: employee._id });
    res.status(201).json({ success: true, data: form });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const getForms = async (req, res) => {
  try {
    const { status, createdBy } = req.query;
    const query = {};
    if (status) query.status = status;
    if (createdBy) query.createdBy = createdBy;

    const forms = await FormDefinition.find(query)
      .populate('createdBy', 'firstName lastName')
      .sort('-createdAt');
    res.status(200).json({ success: true, data: forms });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const getForm = async (req, res) => {
  try {
    const form = await FormDefinition.findById(req.params.id)
      .populate('createdBy', 'firstName lastName');
    if (!form) return res.status(404).json({ success: false, message: 'Form not found' });
    res.status(200).json({ success: true, data: form });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const updateForm = async (req, res) => {
  try {
    const form = await FormDefinition.findByIdAndUpdate(
      req.params.id,
      { ...req.body, $inc: { version: 1 } },
      { new: true, runValidators: true }
    );
    if (!form) return res.status(404).json({ success: false, message: 'Form not found' });
    res.status(200).json({ success: true, data: form });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const submitForm = async (req, res) => {
  try {
    const employee = await Employee.findOne({ userId: req.user.id });
    if (!employee) return res.status(404).json({ success: false, message: 'Employee not found' });

    const submission = await FormSubmission.create({
      form: req.params.id,
      employee: employee._id,
      responses: req.body.responses,
    });
    res.status(201).json({ success: true, data: submission });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const getSubmissions = async (req, res) => {
  try {
    const submissions = await FormSubmission.find({ form: req.params.id })
      .populate('employee', 'firstName lastName employeeId')
      .populate('form', 'title')
      .sort('-submittedAt');
    res.status(200).json({ success: true, data: submissions });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const getFormAnalytics = async (req, res) => {
  try {
    const { id } = req.params;

    const submissions = await FormSubmission.find({ form: id });
    const totalSubmissions = submissions.length;

    const statusBreakdown = submissions.reduce((acc, s) => {
      acc[s.status] = (acc[s.status] || 0) + 1;
      return acc;
    }, {});

    const form = await FormDefinition.findById(id);
    const fieldAggregations = {};
    if (form) {
      form.fields.forEach(field => {
        const values = submissions.map(s => s.responses.get(field.key)).filter(Boolean);
        if (values.length) {
          fieldAggregations[field.key] = { label: field.label, values };
        }
      });
    }

    res.status(200).json({
      success: true,
      data: { totalSubmissions, statusBreakdown, fieldAggregations },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const deleteForm = async (req, res) => {
  try {
    const form = await FormDefinition.findByIdAndDelete(req.params.id);
    if (!form) return res.status(404).json({ success: false, message: 'Form not found' });
    await FormSubmission.deleteMany({ form: req.params.id });
    res.status(200).json({ success: true, data: {} });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
