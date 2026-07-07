import express from 'express';
import {
  getAssets, getAsset, createAsset, updateAsset,
  assignAsset, returnAsset, getMyAssets,
} from '../controllers/assetController.js';
import { protect, authorize } from '../middleware/auth.js';

const router = express.Router();

router.get('/my-assets', protect, getMyAssets);
router.post('/:id/assign', protect, authorize('admin', 'hr'), assignAsset);
router.post('/:id/return', protect, authorize('admin', 'hr'), returnAsset);
router.get('/', protect, getAssets);
router.get('/:id', protect, getAsset);
router.post('/', protect, authorize('admin', 'hr', 'it'), createAsset);
router.put('/:id', protect, authorize('admin', 'hr', 'it'), updateAsset);

export default router;
