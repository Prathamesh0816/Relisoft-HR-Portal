import express from 'express';
import {
  getShifts, getShift, createShift, updateShift, deleteShift,
  assignShift, getMyShift, swapShiftRequest,
} from '../controllers/shiftController.js';
import { protect, authorize } from '../middleware/auth.js';

const router = express.Router();

router.get('/my-shift', protect, getMyShift);
router.post('/swap-request', protect, swapShiftRequest);
router.post('/assign', protect, authorize('admin', 'hr'), assignShift);
router.get('/', protect, getShifts);
router.get('/:id', protect, getShift);
router.post('/', protect, authorize('admin', 'hr'), createShift);
router.put('/:id', protect, authorize('admin', 'hr'), updateShift);
router.delete('/:id', protect, authorize('admin', 'hr'), deleteShift);

export default router;
