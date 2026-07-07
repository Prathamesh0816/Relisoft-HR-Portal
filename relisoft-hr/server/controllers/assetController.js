import Asset from '../models/Asset.js';
import Employee from '../models/Employee.js';

export const getAssets = async (req, res) => {
  try {
    const { page = 1, limit = 10, category, status, assignedTo } = req.query;
    const query = {};
    if (category) query.category = category;
    if (status) query.status = status;
    if (assignedTo) query.assignedTo = assignedTo;

    const assets = await Asset.find(query)
      .populate('assignedTo', 'firstName lastName employeeId')
      .skip((page - 1) * limit)
      .limit(Number(limit))
      .sort('-createdAt');

    const total = await Asset.countDocuments(query);

    res.status(200).json({
      success: true,
      data: assets,
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

export const getAsset = async (req, res) => {
  try {
    const asset = await Asset.findById(req.params.id).populate('assignedTo');
    if (!asset) {
      return res.status(404).json({ success: false, message: 'Asset not found' });
    }
    res.status(200).json({ success: true, data: asset });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const createAsset = async (req, res) => {
  try {
    const asset = await Asset.create(req.body);
    res.status(201).json({ success: true, data: asset });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const updateAsset = async (req, res) => {
  try {
    const asset = await Asset.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });
    if (!asset) {
      return res.status(404).json({ success: false, message: 'Asset not found' });
    }
    res.status(200).json({ success: true, data: asset });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const assignAsset = async (req, res) => {
  try {
    const { employeeId, notes } = req.body;

    const asset = await Asset.findById(req.params.id);
    if (!asset) {
      return res.status(404).json({ success: false, message: 'Asset not found' });
    }

    asset.assignedTo = employeeId;
    asset.assignedAt = Date.now();
    asset.status = 'assigned';
    if (notes) asset.assignmentNotes = notes;
    await asset.save();

    res.status(200).json({ success: true, data: asset });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const returnAsset = async (req, res) => {
  try {
    const { condition, notes } = req.body;

    const asset = await Asset.findById(req.params.id);
    if (!asset) {
      return res.status(404).json({ success: false, message: 'Asset not found' });
    }

    asset.assignedTo = null;
    asset.returnedAt = Date.now();
    asset.status = 'available';
    asset.returnCondition = condition;
    asset.returnNotes = notes;
    await asset.save();

    res.status(200).json({ success: true, data: asset });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const getMyAssets = async (req, res) => {
  try {
    const employee = await Employee.findOne({ userId: req.user.id });
    if (!employee) {
      return res.status(404).json({ success: false, message: 'Employee not found' });
    }

    const assets = await Asset.find({ assignedTo: employee._id });

    res.status(200).json({ success: true, data: assets });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
