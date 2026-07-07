import express from 'express';
import {
  getVirtualIdCards, getMyCard, getVirtualIdCard,
  createVirtualIdCard, updateVirtualIdCard,
  suspend, activate, deleteVirtualIdCard,
} from '../controllers/virtualIdCardController.js';
import { protect, authorize } from '../middleware/auth.js';

const router = express.Router();

router.get('/', protect, getVirtualIdCards);
router.get('/my', protect, getMyCard);
router.get('/employee/:employee', protect, getVirtualIdCard);
router.get('/:id', protect, getVirtualIdCard);
router.post('/', protect, authorize('superadmin', 'admin', 'hr', 'it'), createVirtualIdCard);
router.put('/:id', protect, authorize('superadmin', 'admin', 'hr', 'it'), updateVirtualIdCard);
router.put('/:id/suspend', protect, authorize('superadmin', 'admin', 'hr', 'it'), suspend);
router.put('/:id/activate', protect, authorize('superadmin', 'admin', 'hr', 'it'), activate);
router.delete('/:id', protect, authorize('superadmin', 'admin', 'hr', 'it'), deleteVirtualIdCard);

export default router;
