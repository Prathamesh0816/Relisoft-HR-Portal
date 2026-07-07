import GatePass from '../models/GatePass.js';
import Employee from '../models/Employee.js';

export const getGatePasses = async (req, res) => {
  try {
    const { page = 1, limit = 10, type, status, department } = req.query;
    const query = {};
    if (type) query.type = type;
    if (status) query.status = status;
    if (department) query.department = department;

    const passes = await GatePass.find(query)
      .populate('visitingTo', 'firstName lastName')
      .populate('issuedBy', 'firstName lastName')
      .populate('approvedBy', 'firstName lastName')
      .skip((page - 1) * limit)
      .limit(Number(limit))
      .sort('-createdAt');

    const total = await GatePass.countDocuments(query);

    res.status(200).json({
      success: true,
      data: passes,
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

export const getGatePass = async (req, res) => {
  try {
    const pass = await GatePass.findById(req.params.id)
      .populate('visitingTo')
      .populate('issuedBy')
      .populate('approvedBy');
    if (!pass) {
      return res.status(404).json({ success: false, message: 'Gate pass not found' });
    }
    res.status(200).json({ success: true, data: pass });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const createGatePass = async (req, res) => {
  try {
    const pass = await GatePass.create(req.body);
    res.status(201).json({ success: true, data: pass });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const updateGatePass = async (req, res) => {
  try {
    const pass = await GatePass.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });
    if (!pass) {
      return res.status(404).json({ success: false, message: 'Gate pass not found' });
    }
    res.status(200).json({ success: true, data: pass });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const deleteGatePass = async (req, res) => {
  try {
    const pass = await GatePass.findByIdAndDelete(req.params.id);
    if (!pass) {
      return res.status(404).json({ success: false, message: 'Gate pass not found' });
    }
    res.status(200).json({ success: true, data: {} });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const checkIn = async (req, res) => {
  try {
    const pass = await GatePass.findById(req.params.id);
    if (!pass) {
      return res.status(404).json({ success: false, message: 'Gate pass not found' });
    }

    pass.checkedInAt = Date.now();
    pass.status = 'active';
    await pass.save();

    res.status(200).json({ success: true, data: pass });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const checkOut = async (req, res) => {
  try {
    const pass = await GatePass.findById(req.params.id);
    if (!pass) {
      return res.status(404).json({ success: false, message: 'Gate pass not found' });
    }

    pass.checkedOutAt = Date.now();
    pass.status = 'used';
    await pass.save();

    res.status(200).json({ success: true, data: pass });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const getActive = async (req, res) => {
  try {
    const passes = await GatePass.find({ status: 'active' })
      .populate('visitingTo', 'firstName lastName')
      .populate('issuedBy', 'firstName lastName')
      .sort('-checkedInAt');

    res.status(200).json({ success: true, data: passes });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const getToday = async (req, res) => {
  try {
    const startOfDay = new Date();
    startOfDay.setHours(0, 0, 0, 0);

    const endOfDay = new Date();
    endOfDay.setHours(23, 59, 59, 999);

    const passes = await GatePass.find({
      createdAt: { $gte: startOfDay, $lte: endOfDay },
    })
      .populate('visitingTo', 'firstName lastName')
      .populate('issuedBy', 'firstName lastName')
      .sort('-createdAt');

    res.status(200).json({ success: true, data: passes });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const cancel = async (req, res) => {
  try {
    const pass = await GatePass.findByIdAndUpdate(
      req.params.id,
      { status: 'cancelled' },
      { new: true }
    );

    if (!pass) {
      return res.status(404).json({ success: false, message: 'Gate pass not found' });
    }

    res.status(200).json({ success: true, data: pass });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
