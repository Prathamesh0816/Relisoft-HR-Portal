import LicenseAllocation from '../models/LicenseAllocation.js';
import SoftwareLicense from '../models/SoftwareLicense.js';
import Employee from '../models/Employee.js';

export const getLicenseAllocations = async (req, res) => {
  try {
    const { page = 1, limit = 10, status, license, employee } = req.query;
    const query = {};
    if (status) query.status = status;
    if (license) query.license = license;
    if (employee) query.employee = employee;

    const allocations = await LicenseAllocation.find(query)
      .populate('license', 'name publisher licenseType')
      .populate('employee', 'firstName lastName employeeId')
      .skip((page - 1) * limit)
      .limit(Number(limit))
      .sort('-createdAt');

    const total = await LicenseAllocation.countDocuments(query);

    res.status(200).json({
      success: true,
      data: allocations,
      pagination: {
        page: Number(page),
        limit: Number(limit),
        total,
        pages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const getLicenseAllocation = async (req, res) => {
  try {
    const allocation = await LicenseAllocation.findById(req.params.id)
      .populate('license')
      .populate('employee');
    if (!allocation) {
      return res.status(404).json({ success: false, message: 'License allocation not found' });
    }
    res.status(200).json({ success: true, data: allocation });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const createLicenseAllocation = async (req, res) => {
  try {
    const allocation = await LicenseAllocation.create(req.body);
    res.status(201).json({ success: true, data: allocation });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const updateLicenseAllocation = async (req, res) => {
  try {
    const allocation = await LicenseAllocation.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });
    if (!allocation) {
      return res.status(404).json({ success: false, message: 'License allocation not found' });
    }
    res.status(200).json({ success: true, data: allocation });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const deleteLicenseAllocation = async (req, res) => {
  try {
    const allocation = await LicenseAllocation.findByIdAndDelete(req.params.id);
    if (!allocation) {
      return res.status(404).json({ success: false, message: 'License allocation not found' });
    }
    res.status(200).json({ success: true, data: {} });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const allocate = async (req, res) => {
  try {
    const { licenseId, employeeId, deviceName, notes } = req.body;

    const license = await SoftwareLicense.findById(licenseId);
    if (!license) {
      return res.status(404).json({ success: false, message: 'Software license not found' });
    }

    if (license.usedSeats >= license.totalSeats) {
      return res.status(400).json({ success: false, message: 'No available seats for this license' });
    }

    const existingAllocation = await LicenseAllocation.findOne({
      license: licenseId,
      employee: employeeId,
      status: 'active',
    });
    if (existingAllocation) {
      return res.status(400).json({ success: false, message: 'Employee already has an active allocation for this license' });
    }

    const allocation = await LicenseAllocation.create({
      license: licenseId,
      employee: employeeId,
      deviceName,
      notes,
      allocatedDate: Date.now(),
      status: 'active',
    });

    license.usedSeats += 1;
    await license.save();

    res.status(201).json({ success: true, data: allocation });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const revoke = async (req, res) => {
  try {
    const allocation = await LicenseAllocation.findById(req.params.id);
    if (!allocation) {
      return res.status(404).json({ success: false, message: 'License allocation not found' });
    }

    if (allocation.status !== 'active') {
      return res.status(400).json({ success: false, message: 'Allocation is not active' });
    }

    allocation.status = 'revoked';
    allocation.revokedDate = Date.now();
    await allocation.save();

    const license = await SoftwareLicense.findById(allocation.license);
    if (license && license.usedSeats > 0) {
      license.usedSeats -= 1;
      await license.save();
    }

    res.status(200).json({ success: true, data: allocation });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const getByLicense = async (req, res) => {
  try {
    const { licenseId } = req.params;
    const { page = 1, limit = 10, status } = req.query;
    const query = { license: licenseId };
    if (status) query.status = status;

    const allocations = await LicenseAllocation.find(query)
      .populate('employee', 'firstName lastName employeeId')
      .skip((page - 1) * limit)
      .limit(Number(limit))
      .sort('-createdAt');

    const total = await LicenseAllocation.countDocuments(query);

    res.status(200).json({
      success: true,
      data: allocations,
      pagination: {
        page: Number(page),
        limit: Number(limit),
        total,
        pages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const getByEmployee = async (req, res) => {
  try {
    const { employeeId } = req.params;
    const allocations = await LicenseAllocation.find({ employee: employeeId })
      .populate('license', 'name publisher licenseType')
      .sort('-createdAt');

    res.status(200).json({ success: true, data: allocations });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
