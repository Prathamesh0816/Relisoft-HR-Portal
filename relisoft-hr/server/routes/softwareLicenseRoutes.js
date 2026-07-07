import express from 'express';
import {
  getSoftwareLicenses, getExpiring, getUsageStats,
  getSoftwareLicense, createSoftwareLicense,
  updateSoftwareLicense, deleteSoftwareLicense,
} from '../controllers/softwareLicenseController.js';
import { protect, authorize } from '../middleware/auth.js';

const router = express.Router();

router.get('/', protect, getSoftwareLicenses);
router.get('/expiring', protect, getExpiring);
router.get('/usage-stats', protect, getUsageStats);
router.get('/:id', protect, getSoftwareLicense);
router.post('/', protect, authorize('superadmin', 'admin', 'hr', 'it'), createSoftwareLicense);
router.put('/:id', protect, authorize('superadmin', 'admin', 'hr', 'it'), updateSoftwareLicense);
router.delete('/:id', protect, authorize('superadmin', 'admin', 'hr', 'it'), deleteSoftwareLicense);

export default router;
