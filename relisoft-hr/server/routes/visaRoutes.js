import express from 'express';
import {
  getApplications, createApplication, getApplication, updateApplication,
  updateApplicationStatus, uploadDocument,
  getPassports, createPassport, updatePassport, getExpiryAlerts,
} from '../controllers/visaController.js';
import { protect, authorize } from '../middleware/auth.js';

const router = express.Router();

router.get('/expiry-alerts', protect, getExpiryAlerts);
router.get('/passports', protect, getPassports);
router.post('/passports', protect, createPassport);
router.put('/passports/:id', protect, updatePassport);

router.get('/applications', protect, getApplications);
router.post('/applications', protect, createApplication);
router.get('/applications/:id', protect, getApplication);
router.put('/applications/:id', protect, updateApplication);
router.put('/applications/:id/status', protect, authorize('admin', 'hr'), updateApplicationStatus);
router.post('/applications/:id/documents', protect, uploadDocument);

export default router;
