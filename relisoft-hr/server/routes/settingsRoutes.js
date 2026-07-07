import express from 'express';
import { getSettings, getSetting, updateSetting, updateBulkSettings } from '../controllers/settingsController.js';
import { protect, authorize } from '../middleware/auth.js';

const router = express.Router();

router.put('/bulk', protect, authorize('admin'), updateBulkSettings);
router.get('/', protect, getSettings);
router.get('/:key', protect, getSetting);
router.put('/:key', protect, authorize('admin'), updateSetting);

export default router;
