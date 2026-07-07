import express from 'express';
import {
  getITAssets, getAvailable, getByEmployee, getWarrantyExpiring,
  getITAsset, createITAsset, updateITAsset, assign,
  returnAsset, deleteITAsset,
} from '../controllers/itAssetController.js';
import { protect, authorize } from '../middleware/auth.js';

const router = express.Router();

router.get('/', protect, getITAssets);
router.get('/available', protect, getAvailable);
router.get('/employee/:employee', protect, getByEmployee);
router.get('/warranty-expiring', protect, getWarrantyExpiring);
router.get('/:id', protect, getITAsset);
router.post('/', protect, authorize('superadmin', 'admin', 'hr', 'it'), createITAsset);
router.put('/:id', protect, authorize('superadmin', 'admin', 'hr', 'it'), updateITAsset);
router.put('/:id/assign', protect, authorize('superadmin', 'admin', 'hr', 'it'), assign);
router.put('/:id/return', protect, authorize('superadmin', 'admin', 'hr', 'it'), returnAsset);
router.delete('/:id', protect, authorize('superadmin', 'admin', 'hr', 'it'), deleteITAsset);

export default router;
