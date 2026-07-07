import { IntegrationConfig, IntegrationLog, Webhook } from '../models/Integration.js';

export const getIntegrations = async (req, res) => {
  try {
    const { type, status, page = 1, limit = 10 } = req.query;
    const query = {};
    if (type) query.type = type;
    if (status) query.status = status;

    const integrations = await IntegrationConfig.find(query)
      .skip((page - 1) * limit)
      .limit(Number(limit))
      .sort('-createdAt');

    const total = await IntegrationConfig.countDocuments(query);

    res.status(200).json({
      success: true,
      data: integrations,
      pagination: { page: Number(page), limit: Number(limit), total, pages: Math.ceil(total / limit) },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const createIntegration = async (req, res) => {
  try {
    const integration = await IntegrationConfig.create(req.body);
    res.status(201).json({ success: true, data: integration });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const updateIntegration = async (req, res) => {
  try {
    const integration = await IntegrationConfig.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
    if (!integration) {
      return res.status(404).json({ success: false, message: 'Integration not found' });
    }
    res.status(200).json({ success: true, data: integration });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const deleteIntegration = async (req, res) => {
  try {
    const integration = await IntegrationConfig.findByIdAndDelete(req.params.id);
    if (!integration) {
      return res.status(404).json({ success: false, message: 'Integration not found' });
    }
    await IntegrationLog.deleteMany({ integration: req.params.id });
    await Webhook.deleteMany({ integration: req.params.id });
    res.status(200).json({ success: true, message: 'Integration deleted' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const triggerSync = async (req, res) => {
  try {
    const integration = await IntegrationConfig.findById(req.params.id);
    if (!integration) {
      return res.status(404).json({ success: false, message: 'Integration not found' });
    }

    const log = await IntegrationLog.create({
      integration: integration._id,
      direction: 'outbound',
      entityType: integration.type,
      status: 'success',
      recordsProcessed: 0,
      syncedAt: Date.now(),
    });

    integration.lastSyncAt = Date.now();
    integration.errorCount = 0;
    integration.status = 'connected';
    await integration.save();

    res.status(200).json({ success: true, data: { integration, log } });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const getIntegrationLogs = async (req, res) => {
  try {
    const { page = 1, limit = 10 } = req.query;
    const query = { integration: req.params.id };

    const logs = await IntegrationLog.find(query)
      .sort('-syncedAt')
      .skip((page - 1) * limit)
      .limit(Number(limit));

    const total = await IntegrationLog.countDocuments(query);

    res.status(200).json({
      success: true,
      data: logs,
      pagination: { page: Number(page), limit: Number(limit), total, pages: Math.ceil(total / limit) },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const registerWebhook = async (req, res) => {
  try {
    const webhook = await Webhook.create(req.body);
    res.status(201).json({ success: true, data: webhook });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const getWebhooks = async (req, res) => {
  try {
    const query = {};
    if (req.query.integrationId) query.integration = req.query.integrationId;
    const webhooks = await Webhook.find(query).sort('-createdAt');
    res.status(200).json({ success: true, data: webhooks });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const deleteWebhook = async (req, res) => {
  try {
    const webhook = await Webhook.findByIdAndDelete(req.params.id);
    if (!webhook) {
      return res.status(404).json({ success: false, message: 'Webhook not found' });
    }
    res.status(200).json({ success: true, message: 'Webhook deleted' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const getBiometricStatus = async (req, res) => {
  try {
    const biometricIntegrations = await IntegrationConfig.find({ type: 'biometric' });
    res.status(200).json({ success: true, data: biometricIntegrations });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
