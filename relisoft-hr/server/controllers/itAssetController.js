import ITAsset from '../models/ITAsset.js';
import Employee from '../models/Employee.js';

export const getITAssets = async (req, res) => {
  try {
    const { page = 1, limit = 10, type, status, brand, search } = req.query;
    const query = {};
    if (type) query.type = type;
    if (status) query.status = status;
    if (brand) query.brand = brand;
    if (search) {
      query.$or = [
        { assetTag: { $regex: search, $options: 'i' } },
        { serialNumber: { $regex: search, $options: 'i' } },
        { model: { $regex: search, $options: 'i' } },
      ];
    }

    const assets = await ITAsset.find(query)
      .populate('assignedTo', 'firstName lastName employeeId')
      .populate('vendor', 'name')
      .skip((page - 1) * limit)
      .limit(Number(limit))
      .sort('-createdAt');

    const total = await ITAsset.countDocuments(query);

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

export const getITAsset = async (req, res) => {
  try {
    const asset = await ITAsset.findById(req.params.id)
      .populate('assignedTo')
      .populate('vendor');
    if (!asset) {
      return res.status(404).json({ success: false, message: 'IT asset not found' });
    }
    res.status(200).json({ success: true, data: asset });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const createITAsset = async (req, res) => {
  try {
    const asset = await ITAsset.create(req.body);
    res.status(201).json({ success: true, data: asset });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const updateITAsset = async (req, res) => {
  try {
    const asset = await ITAsset.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });
    if (!asset) {
      return res.status(404).json({ success: false, message: 'IT asset not found' });
    }
    res.status(200).json({ success: true, data: asset });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const deleteITAsset = async (req, res) => {
  try {
    const asset = await ITAsset.findByIdAndDelete(req.params.id);
    if (!asset) {
      return res.status(404).json({ success: false, message: 'IT asset not found' });
    }
    res.status(200).json({ success: true, data: {} });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const assign = async (req, res) => {
  try {
    const { assignedTo, expectedReturnDate, notes } = req.body;

    const asset = await ITAsset.findById(req.params.id);
    if (!asset) {
      return res.status(404).json({ success: false, message: 'IT asset not found' });
    }

    if (asset.status !== 'available') {
      return res.status(400).json({ success: false, message: 'Asset is not available for assignment' });
    }

    asset.assignedTo = assignedTo;
    asset.assignedDate = Date.now();
    asset.expectedReturnDate = expectedReturnDate;
    asset.status = 'issued';
    if (notes) asset.notes = notes;
    await asset.save();

    res.status(200).json({ success: true, data: asset });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const returnAsset = async (req, res) => {
  try {
    const { condition, notes } = req.body;

    const asset = await ITAsset.findById(req.params.id);
    if (!asset) {
      return res.status(404).json({ success: false, message: 'IT asset not found' });
    }

    asset.assignedTo = null;
    asset.assignedDate = null;
    asset.expectedReturnDate = null;
    asset.status = 'available';
    if (condition) asset.condition = condition;
    if (notes) asset.notes = notes;
    await asset.save();

    res.status(200).json({ success: true, data: asset });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const getAvailable = async (req, res) => {
  try {
    const { page = 1, limit = 10, type } = req.query;
    const query = { status: 'available' };
    if (type) query.type = type;

    const assets = await ITAsset.find(query)
      .skip((page - 1) * limit)
      .limit(Number(limit))
      .sort('-createdAt');

    const total = await ITAsset.countDocuments(query);

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

export const getByEmployee = async (req, res) => {
  try {
    const { employeeId } = req.params;
    const assets = await ITAsset.find({ assignedTo: employeeId, status: 'issued' })
      .populate('vendor', 'name')
      .sort('-assignedDate');

    res.status(200).json({ success: true, data: assets });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const getWarrantyExpiring = async (req, res) => {
  try {
    const { days = 30 } = req.query;
    const dateThreshold = new Date();
    dateThreshold.setDate(dateThreshold.getDate() + Number(days));

    const assets = await ITAsset.find({
      warrantyExpiry: { $lte: dateThreshold, $gte: new Date() },
    })
      .populate('assignedTo', 'firstName lastName employeeId')
      .populate('vendor', 'name')
      .sort('warrantyExpiry');

    res.status(200).json({ success: true, data: assets });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
