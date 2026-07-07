import Compliance from '../models/Compliance.js';

export const getCompliances = async (req, res) => {
  try {
    const { page = 1, limit = 10, status, category } = req.query;
    const query = {};
    if (status) query.status = status;
    if (category) query.category = category;

    const compliances = await Compliance.find(query)
      .skip((page - 1) * limit)
      .limit(Number(limit))
      .sort('-createdAt');

    const total = await Compliance.countDocuments(query);

    res.status(200).json({
      success: true,
      data: compliances,
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

export const getCompliance = async (req, res) => {
  try {
    const compliance = await Compliance.findById(req.params.id);
    if (!compliance) {
      return res.status(404).json({ success: false, message: 'Compliance not found' });
    }
    res.status(200).json({ success: true, data: compliance });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const createCompliance = async (req, res) => {
  try {
    const compliance = await Compliance.create(req.body);
    res.status(201).json({ success: true, data: compliance });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const updateCompliance = async (req, res) => {
  try {
    const compliance = await Compliance.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });
    if (!compliance) {
      return res.status(404).json({ success: false, message: 'Compliance not found' });
    }
    res.status(200).json({ success: true, data: compliance });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const markCompleted = async (req, res) => {
  try {
    const compliance = await Compliance.findByIdAndUpdate(
      req.params.id,
      { status: 'completed', completedAt: Date.now() },
      { new: true }
    );
    if (!compliance) {
      return res.status(404).json({ success: false, message: 'Compliance not found' });
    }
    res.status(200).json({ success: true, data: compliance });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const getUpcoming = async (req, res) => {
  try {
    const { days = 30 } = req.query;
    const futureDate = new Date();
    futureDate.setDate(futureDate.getDate() + parseInt(days));

    const compliances = await Compliance.find({
      dueDate: { $gte: new Date(), $lte: futureDate },
      status: { $ne: 'completed' },
    }).sort('dueDate');

    res.status(200).json({ success: true, data: compliances });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
