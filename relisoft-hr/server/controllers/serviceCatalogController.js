import ServiceCatalog from '../models/ServiceCatalog.js';

export const getServiceCatalogs = async (req, res) => {
  try {
    const { page = 1, limit = 10, category, type, isActive, search } = req.query;
    const query = {};
    if (category) query.category = category;
    if (type) query.type = type;
    if (isActive !== undefined) query.isActive = isActive === 'true';
    if (search) query.name = { $regex: search, $options: 'i' };

    const catalogs = await ServiceCatalog.find(query)
      .populate('category', 'name description')
      .populate('workflow', 'name')
      .skip((page - 1) * limit)
      .limit(Number(limit))
      .sort('-createdAt');

    const total = await ServiceCatalog.countDocuments(query);

    res.status(200).json({
      success: true,
      data: catalogs,
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

export const getServiceCatalog = async (req, res) => {
  try {
    const catalog = await ServiceCatalog.findById(req.params.id)
      .populate('category')
      .populate('workflow');
    if (!catalog) {
      return res.status(404).json({ success: false, message: 'Service catalog item not found' });
    }
    res.status(200).json({ success: true, data: catalog });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const createServiceCatalog = async (req, res) => {
  try {
    const catalog = await ServiceCatalog.create(req.body);
    res.status(201).json({ success: true, data: catalog });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const updateServiceCatalog = async (req, res) => {
  try {
    const catalog = await ServiceCatalog.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });
    if (!catalog) {
      return res.status(404).json({ success: false, message: 'Service catalog item not found' });
    }
    res.status(200).json({ success: true, data: catalog });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const deleteServiceCatalog = async (req, res) => {
  try {
    const catalog = await ServiceCatalog.findByIdAndDelete(req.params.id);
    if (!catalog) {
      return res.status(404).json({ success: false, message: 'Service catalog item not found' });
    }
    res.status(200).json({ success: true, data: {} });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const getByCategory = async (req, res) => {
  try {
    const { categoryId } = req.params;
    const catalogs = await ServiceCatalog.find({ category: categoryId, isActive: true })
      .populate('category', 'name')
      .sort('name');
    res.status(200).json({ success: true, data: catalogs });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const toggleActive = async (req, res) => {
  try {
    const catalog = await ServiceCatalog.findById(req.params.id);
    if (!catalog) {
      return res.status(404).json({ success: false, message: 'Service catalog item not found' });
    }
    catalog.isActive = !catalog.isActive;
    await catalog.save();
    res.status(200).json({ success: true, data: catalog });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
