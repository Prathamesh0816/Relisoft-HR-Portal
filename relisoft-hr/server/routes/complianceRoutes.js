import express from 'express';
import {
  getCompliances, getCompliance, createCompliance, updateCompliance,
  markCompleted, getUpcoming,
} from '../controllers/complianceController.js';
import { protect, authorize } from '../middleware/auth.js';

const router = express.Router();

router.get('/upcoming', protect, getUpcoming);
router.get('/', protect, getCompliances);
router.get('/:id', protect, getCompliance);
router.post('/', protect, authorize('admin', 'hr'), createCompliance);
router.put('/:id', protect, authorize('admin', 'hr'), updateCompliance);
router.put('/:id/complete', protect, authorize('admin', 'hr'), markCompleted);

export default router;
