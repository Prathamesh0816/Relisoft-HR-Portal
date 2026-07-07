import Holiday from '../models/Holiday.js';

export const getHolidays = async (req, res) => {
  try {
    const { year, location, page = 1, limit = 20 } = req.query;
    const query = { isActive: true };
    if (year) {
      query.date = {
        $gte: new Date(`${year}-01-01`),
        $lte: new Date(`${year}-12-31`),
      };
    }
    if (location) query.location = location;

    const holidays = await Holiday.find(query)
      .skip((page - 1) * limit)
      .limit(Number(limit))
      .sort('date');

    const total = await Holiday.countDocuments(query);

    res.status(200).json({
      success: true,
      data: holidays,
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

export const getHoliday = async (req, res) => {
  try {
    const holiday = await Holiday.findById(req.params.id);
    if (!holiday) {
      return res.status(404).json({ success: false, message: 'Holiday not found' });
    }
    res.status(200).json({ success: true, data: holiday });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const createHoliday = async (req, res) => {
  try {
    const holiday = await Holiday.create(req.body);
    res.status(201).json({ success: true, data: holiday });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const updateHoliday = async (req, res) => {
  try {
    const holiday = await Holiday.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });

    if (!holiday) {
      return res.status(404).json({ success: false, message: 'Holiday not found' });
    }

    res.status(200).json({ success: true, data: holiday });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const deleteHoliday = async (req, res) => {
  try {
    const holiday = await Holiday.findByIdAndUpdate(
      req.params.id,
      { isActive: false },
      { new: true }
    );

    if (!holiday) {
      return res.status(404).json({ success: false, message: 'Holiday not found' });
    }

    res.status(200).json({ success: true, message: 'Holiday deleted' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
