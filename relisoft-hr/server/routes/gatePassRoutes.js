import express from 'express';
import {
  getGatePasses, getToday, getActive, getGatePass,
  createGatePass, updateGatePass, checkIn, checkOut, cancel,
} from '../controllers/gatePassController.js';
import { protect, authorize } from '../middleware/auth.js';

const router = express.Router();

router.get('/', protect, getGatePasses);
router.get('/today', protect, getToday);
router.get('/active', protect, getActive);
router.get('/:id', protect, getGatePass);
router.post('/', protect, createGatePass);
router.put('/:id', protect, authorize('superadmin', 'admin', 'hr'), updateGatePass);
router.put('/:id/checkin', protect, checkIn);
router.put('/:id/checkout', protect, checkOut);
router.put('/:id/cancel', protect, authorize('superadmin', 'admin', 'hr'), cancel);

export default router;
