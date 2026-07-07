import Policy from '../models/Policy.js';

export const getPolicies = async (req, res) => {
  try {
    const { page = 1, limit = 10, category, status, search } = req.query;
    const query = {};
    if (category) query.category = category;
    if (status) query.status = status;
    if (search) {
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
      ];
    }

    const policies = await Policy.find(query)
      .populate('owner', 'firstName lastName')
      .skip((page - 1) * limit)
      .limit(Number(limit))
      .sort('-createdAt');

    const total = await Policy.countDocuments(query);

    res.status(200).json({
      success: true,
      data: policies,
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

export const getPolicy = async (req, res) => {
  try {
    const policy = await Policy.findById(req.params.id).populate('owner');
    if (!policy) {
      return res.status(404).json({ success: false, message: 'Policy not found' });
    }
    res.status(200).json({ success: true, data: policy });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const createPolicy = async (req, res) => {
  try {
    const policy = await Policy.create(req.body);
    res.status(201).json({ success: true, data: policy });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const updatePolicy = async (req, res) => {
  try {
    const policy = await Policy.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });
    if (!policy) {
      return res.status(404).json({ success: false, message: 'Policy not found' });
    }
    res.status(200).json({ success: true, data: policy });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const deletePolicy = async (req, res) => {
  try {
    const policy = await Policy.findByIdAndDelete(req.params.id);
    if (!policy) {
      return res.status(404).json({ success: false, message: 'Policy not found' });
    }
    res.status(200).json({ success: true, data: {} });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const getActive = async (req, res) => {
  try {
    const { page = 1, limit = 10, category } = req.query;
    const query = { status: 'active' };
    if (category) query.category = category;

    const policies = await Policy.find(query)
      .populate('owner', 'firstName lastName')
      .skip((page - 1) * limit)
      .limit(Number(limit))
      .sort('-effectiveDate');

    const total = await Policy.countDocuments(query);

    res.status(200).json({
      success: true,
      data: policies,
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

export const archive = async (req, res) => {
  try {
    const policy = await Policy.findByIdAndUpdate(
      req.params.id,
      { status: 'archived' },
      { new: true }
    );

    if (!policy) {
      return res.status(404).json({ success: false, message: 'Policy not found' });
    }

    res.status(200).json({ success: true, data: policy });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
