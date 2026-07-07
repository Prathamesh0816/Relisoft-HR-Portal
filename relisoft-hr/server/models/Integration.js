import mongoose from 'mongoose';

const integrationConfigSchema = new mongoose.Schema({
  name: { type: String, required: true },
  type: {
    type: String,
    enum: ['erp', 'm365', 'googleWorkspace', 'banking', 'biometric', 'bgv', 'governmentPortal', 'other'],
    required: true,
  },
  provider: { type: String, required: true },
  config: { type: mongoose.Schema.Types.Mixed },
  isActive: { type: Boolean, default: true },
  lastSyncAt: { type: Date },
  syncFrequency: {
    type: String,
    enum: ['realtime', 'hourly', 'daily', 'weekly', 'manual'],
    default: 'manual',
  },
  errorCount: { type: Number, default: 0 },
  status: {
    type: String,
    enum: ['connected', 'disconnected', 'error', 'pending-setup'],
    default: 'pending-setup',
  },
}, { timestamps: true });

const integrationLogSchema = new mongoose.Schema({
  integration: { type: mongoose.Schema.Types.ObjectId, ref: 'Integration', required: true },
  direction: { type: String, enum: ['inbound', 'outbound'], required: true },
  entityType: { type: String, required: true },
  status: { type: String, enum: ['success', 'partial', 'failed'], required: true },
  recordsProcessed: { type: Number, default: 0 },
  recordsFailed: { type: Number, default: 0 },
  errorMessage: { type: String },
  responseData: { type: mongoose.Schema.Types.Mixed },
  syncedAt: { type: Date, default: Date.now },
}, { timestamps: true });

const webhookSchema = new mongoose.Schema({
  integration: { type: mongoose.Schema.Types.ObjectId, ref: 'Integration' },
  name: { type: String, required: true },
  url: { type: String, required: true },
  events: [{ type: String }],
  secret: { type: String },
  isActive: { type: Boolean, default: true },
  retryPolicy: {
    maxRetries: { type: Number, default: 3 },
    retryIntervalMinutes: { type: Number, default: 5 },
  },
  lastTriggeredAt: { type: Date },
  consecutiveFailures: { type: Number, default: 0 },
}, { timestamps: true });

export const IntegrationConfig = mongoose.model('Integration', integrationConfigSchema);
export const IntegrationLog = mongoose.model('IntegrationLog', integrationLogSchema);
export const Webhook = mongoose.model('Webhook', webhookSchema);
