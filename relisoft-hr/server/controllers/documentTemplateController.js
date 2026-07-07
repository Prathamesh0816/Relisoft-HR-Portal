import docGenService, { RELISOFT_BRANDING } from '../services/documentGenerationService.js';
import Employee from '../models/Employee.js';

export const getTemplates = (req, res) => {
  const templates = docGenService.getAllTemplates();
  res.status(200).json({ success: true, data: templates, count: templates.length });
};

export const getTemplate = (req, res) => {
  const template = docGenService.getTemplate(req.params.code);
  if (!template) return res.status(404).json({ success: false, message: 'Template not found' });
  res.status(200).json({ success: true, data: template });
};

export const generateDocument = async (req, res) => {
  try {
    const { templateCode, employeeId, variables } = req.body;
    if (!templateCode) return res.status(400).json({ success: false, message: 'templateCode is required' });

    let employee = null;
    if (employeeId) {
      employee = await Employee.findById(employeeId);
      if (!employee) return res.status(404).json({ success: false, message: 'Employee not found' });
    }

    const html = await docGenService.generateDocument(templateCode, employee, variables || {});
    res.status(200).json({ success: true, data: { html, employee: employee || null } });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const generateWithAutoFill = async (req, res) => {
  try {
    const { employeeId } = req.params;
    const employee = await Employee.findById(employeeId);
    if (!employee) return res.status(404).json({ success: false, message: 'Employee not found' });

    const allTemplates = docGenService.getAllTemplates();
    const templatesWithVars = allTemplates.filter(t => t.variables?.some(v => v.type === 'text' || v.type === 'select'));

    const autoFields = {
      empName: `${employee.firstName} ${employee.lastName}`,
      empFirstName: employee.firstName,
      empLastName: employee.lastName,
      empEmail: employee.email,
      empPhone: employee.phone,
      empDesignation: employee.designation || employee.position,
      empDepartment: employee.department,
      empId: employee.employeeId || employee.empId,
      empGrade: employee.grade || employee.level,
      empJoinDate: employee.joinDate ? new Date(employee.joinDate).toLocaleDateString('en-IN') : '',
      empPan: employee.pan || employee.panNumber,
      empAadhaar: employee.aadhaar || employee.aadhaarNumber,
      empUan: employee.uan || employee.epfUan,
      empBankName: employee.bankName,
      empBankAccount: employee.bankAccount || employee.accountNumber,
      empIfsc: employee.ifsc || employee.ifscCode,
      empAddress: employee.address || employee.permanentAddress,
    };

    res.status(200).json({
      success: true,
      data: { employee, autoFields, templates: templatesWithVars.map(t => ({ code: t.code, name: t.name, category: t.category, requiredVars: t.variables?.filter(v => v.required).map(v => v.label) || [] })) },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const getBranding = (req, res) => {
  res.status(200).json({ success: true, data: RELISOFT_BRANDING });
};

export const previewDocument = async (req, res) => {
  try {
    const { templateCode, employeeId } = req.query;
    if (!templateCode) return res.status(400).json({ success: false, message: 'templateCode is required' });

    let employee = null;
    if (employeeId) {
      employee = await Employee.findById(employeeId).lean();
    }

    const html = await docGenService.generateDocument(templateCode, employee, req.query);
    res.status(200).json({ success: true, data: { html } });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
