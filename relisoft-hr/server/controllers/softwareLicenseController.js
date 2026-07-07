import SoftwareLicense from '../models/SoftwareLicense.js';

export const getSoftwareLicenses = async (req, res) => {
  try {
    const { page = 1, limit = 10, status, licenseType, publisher, search } = req.query;
    const query = {};
    if (status) query.status = status;
    if (licenseType) query.licenseType = licenseType;
    if (publisher) query.publisher = { $regex: publisher, $options: 'i' };
    if (search) query.name = { $regex: search, $options: 'i' };

    const licenses = await SoftwareLicense.find(query)
      .populate('vendor', 'name')
      .skip((page - 1) * limit)
      .limit(Number(limit))
      .sort('-createdAt');

    const total = await SoftwareLicense.countDocuments(query);

    res.status(200).json({
      success: true,
      data: licenses,
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

export const getSoftwareLicense = async (req, res) => {
  try {
    const license = await SoftwareLicense.findById(req.params.id).populate('vendor');
    if (!license) {
      return res.status(404).json({ success: false, message: 'Software license not found' });
    }
    res.status(200).json({ success: true, data: license });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const createSoftwareLicense = async (req, res) => {
  try {
    const license = await SoftwareLicense.create(req.body);
    res.status(201).json({ success: true, data: license });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const updateSoftwareLicense = async (req, res) => {
  try {
    const license = await SoftwareLicense.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });
    if (!license) {
      return res.status(404).json({ success: false, message: 'Software license not found' });
    }
    res.status(200).json({ success: true, data: license });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const deleteSoftwareLicense = async (req, res) => {
  try {
    const license = await SoftwareLicense.findByIdAndDelete(req.params.id);
    if (!license) {
      return res.status(404).json({ success: false, message: 'Software license not found' });
    }
    res.status(200).json({ success: true, data: {} });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const getExpiring = async (req, res) => {
  try {
    const { days = 30 } = req.query;
    const dateThreshold = new Date();
    dateThreshold.setDate(dateThreshold.getDate() + Number(days));

    const licenses = await SoftwareLicense.find({
      expiryDate: { $lte: dateThreshold, $gte: new Date() },
      status: { $ne: 'expired' },
    })
      .populate('vendor', 'name')
      .sort('expiryDate');

    res.status(200).json({ success: true, data: licenses });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const getUsageStats = async (req, res) => {
  try {
    const licenses = await SoftwareLicense.find({ status: { $ne: 'cancelled' } });

    const stats = licenses.map((l) => ({
      _id: l._id,
      name: l.name,
      totalSeats: l.totalSeats,
      usedSeats: l.usedSeats,
      availableSeats: l.totalSeats - l.usedSeats,
      usagePercentage: l.totalSeats > 0 ? Math.round((l.usedSeats / l.totalSeats) * 100) : 0,
      status: l.status,
    }));

    const summary = {
      totalLicenses: licenses.length,
      totalSeats: licenses.reduce((sum, l) => sum + l.totalSeats, 0),
      totalUsed: licenses.reduce((sum, l) => sum + l.usedSeats, 0),
      totalAvailable: licenses.reduce((sum, l) => sum + (l.totalSeats - l.usedSeats), 0),
    };

    res.status(200).json({
      success: true,
      data: { summary, details: stats },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
