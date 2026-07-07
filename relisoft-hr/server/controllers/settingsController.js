import Setting from '../models/Setting.js';

export const getSettings = async (req, res) => {
  try {
    const { group } = req.query;
    const query = {};
    if (group) query.group = group;

    const settings = await Setting.find(query).sort('key');
    res.status(200).json({ success: true, data: settings });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const getSetting = async (req, res) => {
  try {
    const setting = await Setting.findOne({ key: req.params.key });
    if (!setting) {
      return res.status(404).json({ success: false, message: 'Setting not found' });
    }
    res.status(200).json({ success: true, data: setting });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const updateSetting = async (req, res) => {
  try {
    const { value } = req.body;

    const setting = await Setting.findOneAndUpdate(
      { key: req.params.key },
      { value, updatedBy: req.user.id },
      { new: true, upsert: true }
    );

    res.status(200).json({ success: true, data: setting });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const updateBulkSettings = async (req, res) => {
  try {
    const { settings } = req.body;
    const results = [];

    for (const { key, value, group } of settings) {
      const setting = await Setting.findOneAndUpdate(
        { key },
        { value, group, updatedBy: req.user.id },
        { new: true, upsert: true }
      );
      results.push(setting);
    }

    res.status(200).json({ success: true, data: results });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
