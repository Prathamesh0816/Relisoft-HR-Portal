import path from 'path';
import fs from 'fs';
import Employee from '../models/Employee.js';
import EmployeeOnboardingProfile from '../models/EmployeeOnboardingProfile.js';
import EmployeeOnboardingDocument from '../models/EmployeeOnboardingDocument.js';
import Onboarding from '../models/Onboarding.js';

const UPLOAD_DIR = path.resolve('uploads/onboarding');

export const getProfile = async (req, res) => {
  try {
    const empId = req.params.employeeId;
    const employee = await Employee.findById(empId).lean();
    if (!employee) return res.status(404).json({ message: 'Employee not found' });

    const profile = await EmployeeOnboardingProfile.findOne({ employee: empId }).lean();
    const documents = await EmployeeOnboardingDocument.find({ employee: empId })
      .sort('-uploadedOn')
      .lean();

    res.json({
      employee: {
        id: employee._id,
        employeeCode: employee.employeeCode,
        firstName: employee.firstName,
        lastName: employee.lastName,
        email: employee.email,
        department: employee.department,
        designation: employee.designation,
        jobRole: employee.jobRole,
        employmentType: employee.employmentType,
        workLocation: employee.workLocation,
        dateOfJoining: employee.dateOfJoining,
      },
      profile: profile ? {
        employeeId: profile.employee,
        panNumber: profile.panNumber,
        aadhaarNumber: profile.aadhaarNumber,
        hasPriorExperience: profile.hasPriorExperience,
        previousEmployerName: profile.previousEmployerName,
        yearsOfExperience: profile.yearsOfExperience,
        relievingEmailForwarded: profile.relievingEmailForwarded,
        lastUpdatedOn: profile.lastUpdatedOn,
      } : null,
      documents: documents.map(d => ({
        id: d._id,
        documentType: d.documentType,
        originalFileName: d.originalFileName,
        uploadedOn: d.uploadedOn,
      })),
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const saveProfile = async (req, res) => {
  try {
    const { employeeId, panNumber, aadhaarNumber, hasPriorExperience,
      previousEmployerName, yearsOfExperience, relievingEmailForwarded } = req.body;

    const emp = await Employee.findById(employeeId);
    if (!emp) return res.status(404).json({ message: 'Employee not found' });

    if (!panNumber || panNumber.length < 10) {
      return res.status(400).json({ message: 'PAN number is required' });
    }

    if (!aadhaarNumber || aadhaarNumber.replace(/\s/g, '').length < 12) {
      return res.status(400).json({ message: 'Aadhaar number is required' });
    }

    if (hasPriorExperience && !req.files?.experienceLetter && !req.files?.salarySlips?.length) {
      return res.status(400).json({ message: 'Upload at least one prior-experience document' });
    }

    let profile = await EmployeeOnboardingProfile.findOne({ employee: employeeId });
    if (!profile) {
      profile = new EmployeeOnboardingProfile({ employee: employeeId });
    }

    profile.panNumber = panNumber;
    profile.aadhaarNumber = aadhaarNumber;
    profile.hasPriorExperience = !!hasPriorExperience;
    profile.previousEmployerName = hasPriorExperience ? previousEmployerName : null;
    profile.yearsOfExperience = hasPriorExperience ? yearsOfExperience : null;
    profile.relievingEmailForwarded = hasPriorExperience && relievingEmailForwarded;
    profile.lastUpdatedOn = new Date();
    await profile.save();

    if (req.files) {
      if (req.files.experienceLetter) {
        await saveDocument(employeeId, req.files.experienceLetter[0], 'Experience Letter');
      }
      if (req.files.salarySlips) {
        for (const file of req.files.salarySlips) {
          await saveDocument(employeeId, file, 'Salary Slip');
        }
      }
      if (req.files.additionalDocuments) {
        for (const file of req.files.additionalDocuments) {
          await saveDocument(employeeId, file, 'Additional Document');
        }
      }
    }

    res.json({ message: 'Onboarding profile saved successfully.' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

async function saveDocument(employeeId, file, documentType) {
  if (!file) return;
  const dir = path.join(UPLOAD_DIR, String(employeeId));
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });

  const storedFileName = `${Date.now()}-${file.originalname}`;
  const relativePath = `onboarding/${employeeId}/${storedFileName}`;
  const absolutePath = path.resolve(UPLOAD_DIR, String(employeeId), storedFileName);

  fs.writeFileSync(absolutePath, file.buffer);

  await EmployeeOnboardingDocument.create({
    employee: employeeId,
    documentType,
    originalFileName: file.originalname,
    storedFileName,
    contentType: file.mimetype || 'application/octet-stream',
    relativePath,
    uploadedOn: new Date(),
  });
}

export const downloadDocument = async (req, res) => {
  try {
    const doc = await EmployeeOnboardingDocument.findById(req.params.documentId);
    if (!doc) return res.status(404).json({ message: 'Document not found' });

    const absolutePath = path.resolve(UPLOAD_DIR, String(doc.employee), doc.storedFileName);
    if (!fs.existsSync(absolutePath)) return res.status(404).json({ message: 'File not found' });

    res.download(absolutePath, doc.originalFileName);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Legacy exports for existing onboarding routes
export const getOnboardings = async (req, res) => {
  try {
    const { page = 1, limit = 10, status } = req.query;
    const query = {};
    if (status) query.status = status;
    const onboardings = await Onboarding.find(query)
      .populate('employee', 'firstName lastName employeeId')
      .skip((page - 1) * limit)
      .limit(Number(limit))
      .sort('-createdAt');
    const total = await Onboarding.countDocuments(query);
    res.status(200).json({ success: true, data: onboardings, pagination: { page: Number(page), limit: Number(limit), total, pages: Math.ceil(total / limit) } });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const getOnboarding = async (req, res) => {
  try {
    const onboarding = await Onboarding.findById(req.params.id).populate('employee', 'firstName lastName employeeId department');
    if (!onboarding) return res.status(404).json({ success: false, message: 'Onboarding not found' });
    res.status(200).json({ success: true, data: onboarding });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const createOnboarding = async (req, res) => {
  try {
    const onboarding = await Onboarding.create(req.body);
    res.status(201).json({ success: true, data: onboarding });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const updateDocumentStatus = async (req, res) => {
  try {
    const onboarding = await Onboarding.findByIdAndUpdate(req.params.id, { documentStatus: req.body.status }, { new: true });
    if (!onboarding) return res.status(404).json({ success: false, message: 'Onboarding not found' });
    res.status(200).json({ success: true, data: onboarding });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const updateITSetup = async (req, res) => {
  try {
    const onboarding = await Onboarding.findByIdAndUpdate(req.params.id, { itSetup: req.body }, { new: true });
    if (!onboarding) return res.status(404).json({ success: false, message: 'Onboarding not found' });
    res.status(200).json({ success: true, data: onboarding });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const updateAssetAllocation = async (req, res) => {
  try {
    const onboarding = await Onboarding.findByIdAndUpdate(req.params.id, { assets: req.body.assets }, { new: true });
    if (!onboarding) return res.status(404).json({ success: false, message: 'Onboarding not found' });
    res.status(200).json({ success: true, data: onboarding });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const updateOnboardingStatus = async (req, res) => {
  try {
    const onboarding = await Onboarding.findByIdAndUpdate(req.params.id, { status: req.body.status }, { new: true });
    if (!onboarding) return res.status(404).json({ success: false, message: 'Onboarding not found' });
    res.status(200).json({ success: true, data: onboarding });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const completeOnboarding = async (req, res) => {
  try {
    const onboarding = await Onboarding.findByIdAndUpdate(req.params.id, { status: 'completed' }, { new: true });
    if (!onboarding) return res.status(404).json({ success: false, message: 'Onboarding not found' });
    res.status(200).json({ success: true, data: onboarding });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
