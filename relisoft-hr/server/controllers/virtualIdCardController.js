import VirtualIdCard from '../models/VirtualIdCard.js';
import Employee from '../models/Employee.js';

export const getVirtualIdCards = async (req, res) => {
  try {
    const { page = 1, limit = 10, status, department } = req.query;
    const query = {};
    if (status) query.status = status;
    if (department) query.department = department;

    const cards = await VirtualIdCard.find(query)
      .populate('employee', 'firstName lastName employeeId')
      .populate('issuedBy', 'firstName lastName')
      .skip((page - 1) * limit)
      .limit(Number(limit))
      .sort('-createdAt');

    const total = await VirtualIdCard.countDocuments(query);

    res.status(200).json({
      success: true,
      data: cards,
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

export const getVirtualIdCard = async (req, res) => {
  try {
    const card = await VirtualIdCard.findById(req.params.id)
      .populate('employee')
      .populate('issuedBy');
    if (!card) {
      return res.status(404).json({ success: false, message: 'Virtual ID card not found' });
    }
    res.status(200).json({ success: true, data: card });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const createVirtualIdCard = async (req, res) => {
  try {
    const card = await VirtualIdCard.create(req.body);
    res.status(201).json({ success: true, data: card });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const updateVirtualIdCard = async (req, res) => {
  try {
    const card = await VirtualIdCard.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });
    if (!card) {
      return res.status(404).json({ success: false, message: 'Virtual ID card not found' });
    }
    res.status(200).json({ success: true, data: card });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const deleteVirtualIdCard = async (req, res) => {
  try {
    const card = await VirtualIdCard.findByIdAndDelete(req.params.id);
    if (!card) {
      return res.status(404).json({ success: false, message: 'Virtual ID card not found' });
    }
    res.status(200).json({ success: true, data: {} });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const getMyCard = async (req, res) => {
  try {
    const employee = await Employee.findOne({ userId: req.user.id });
    if (!employee) {
      return res.status(404).json({ success: false, message: 'Employee not found' });
    }

    const card = await VirtualIdCard.findOne({ employee: employee._id })
      .populate('issuedBy', 'firstName lastName');

    if (!card) {
      return res.status(404).json({ success: false, message: 'Virtual ID card not found for this employee' });
    }

    res.status(200).json({ success: true, data: card });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const generateQR = async (req, res) => {
  try {
    const card = await VirtualIdCard.findById(req.params.id);
    if (!card) {
      return res.status(404).json({ success: false, message: 'Virtual ID card not found' });
    }

    const qrData = JSON.stringify({
      cardNumber: card.cardNumber,
      employee: card.employee,
      status: card.status,
    });

    card.qrCode = qrData;
    await card.save();

    res.status(200).json({ success: true, data: card });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const suspend = async (req, res) => {
  try {
    const card = await VirtualIdCard.findByIdAndUpdate(
      req.params.id,
      { status: 'suspended' },
      { new: true }
    );

    if (!card) {
      return res.status(404).json({ success: false, message: 'Virtual ID card not found' });
    }

    res.status(200).json({ success: true, data: card });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const activate = async (req, res) => {
  try {
    const card = await VirtualIdCard.findByIdAndUpdate(
      req.params.id,
      { status: 'active' },
      { new: true }
    );

    if (!card) {
      return res.status(404).json({ success: false, message: 'Virtual ID card not found' });
    }

    res.status(200).json({ success: true, data: card });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
