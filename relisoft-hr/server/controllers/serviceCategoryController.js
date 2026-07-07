import ServiceCategory from '../models/ServiceCategory.js';

export const getServiceCategories = async (req, res) => {
  try {
    const { page = 1, limit = 10, isActive, search } = req.query;
    const query = {};
    if (isActive !== undefined) query.isActive = isActive === 'true';
    if (search) query.name = { $regex: search, $options: 'i' };

    const categories = await ServiceCategory.find(query)
      .skip((page - 1) * limit)
      .limit(Number(limit))
      .sort('displayOrder');

    const total = await ServiceCategory.countDocuments(query);

    res.status(200).json({
      success: true,
      data: categories,
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

export const getServiceCategory = async (req, res) => {
  try {
    const category = await ServiceCategory.findById(req.params.id);
    if (!category) {
      return res.status(404).json({ success: false, message: 'Service category not found' });
    }
    res.status(200).json({ success: true, data: category });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const createServiceCategory = async (req, res) => {
  try {
    const category = await ServiceCategory.create(req.body);
    res.status(201).json({ success: true, data: category });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const updateServiceCategory = async (req, res) => {
  try {
    const category = await ServiceCategory.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });
    if (!category) {
      return res.status(404).json({ success: false, message: 'Service category not found' });
    }
    res.status(200).json({ success: true, data: category });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const deleteServiceCategory = async (req, res) => {
  try {
    const category = await ServiceCategory.findByIdAndDelete(req.params.id);
    if (!category) {
      return res.status(404).json({ success: false, message: 'Service category not found' });
    }
    res.status(200).json({ success: true, data: {} });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
