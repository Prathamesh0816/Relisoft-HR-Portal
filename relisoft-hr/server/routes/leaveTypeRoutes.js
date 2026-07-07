import express from 'express';
import { getLeaveTypes, createLeaveType, updateLeaveType, deleteLeaveType } from '../controllers/leaveTypeController.js';
import { protect, authorize } from '../middleware/auth.js';

const router = express.Router();

router.get('/', protect, getLeaveTypes);
router.post('/', protect, authorize('admin', 'hr'), createLeaveType);
router.put('/:id', protect, authorize('admin', 'hr'), updateLeaveType);
router.delete('/:id', protect, authorize('admin'), deleteLeaveType);

export default router;
