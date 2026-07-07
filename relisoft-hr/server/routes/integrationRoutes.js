import express from 'express';
import {
  getIntegrations, createIntegration, updateIntegration, deleteIntegration,
  triggerSync, getIntegrationLogs, registerWebhook, getWebhooks,
  deleteWebhook, getBiometricStatus,
} from '../controllers/integrationController.js';
import { protect, authorize } from '../middleware/auth.js';

const router = express.Router();

router.get('/biometric/status', protect, getBiometricStatus);
router.get('/webhooks', protect, getWebhooks);
router.post('/webhooks', protect, authorize('admin', 'it'), registerWebhook);
router.delete('/webhooks/:id', protect, authorize('admin', 'it'), deleteWebhook);
router.get('/', protect, getIntegrations);
router.post('/', protect, authorize('admin', 'it'), createIntegration);
router.put('/:id', protect, authorize('admin', 'it'), updateIntegration);
router.delete('/:id', protect, authorize('admin', 'it'), deleteIntegration);
router.post('/:id/sync', protect, authorize('admin', 'it'), triggerSync);
router.get('/:id/logs', protect, getIntegrationLogs);

export default router;
