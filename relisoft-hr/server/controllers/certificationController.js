import Certification from '../models/Certification.js';
import Employee from '../models/Employee.js';

export const getMyCertifications = async (req, res) => {
  try {
    const employee = await Employee.findOne({ userId: req.user.id });
    if (!employee) return res.status(404).json({ success: false, message: 'Employee not found' });

    const certifications = await Certification.find({ employee: employee._id }).sort('-issueDate');
    res.status(200).json({ success: true, data: certifications });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const getEmployeeCertifications = async (req, res) => {
  try {
    const certifications = await Certification.find({ employee: req.params.employeeId })
      .populate('training', 'title')
      .sort('-issueDate');
    res.status(200).json({ success: true, data: certifications });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const createCertification = async (req, res) => {
  try {
    const certification = await Certification.create(req.body);
    res.status(201).json({ success: true, data: certification });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const updateCertification = async (req, res) => {
  try {
    const certification = await Certification.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
    if (!certification) return res.status(404).json({ success: false, message: 'Certification not found' });
    res.status(200).json({ success: true, data: certification });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const getExpiringCertifications = async (req, res) => {
  try {
    const { days = 90 } = req.query;
    const futureDate = new Date();
    futureDate.setDate(futureDate.getDate() + parseInt(days));
    const certifications = await Certification.find({
      expiryDate: { $lte: futureDate, $gte: new Date() },
      status: 'active',
    }).populate('employee', 'firstName lastName employeeId');
    res.status(200).json({ success: true, count: certifications.length, data: certifications });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
