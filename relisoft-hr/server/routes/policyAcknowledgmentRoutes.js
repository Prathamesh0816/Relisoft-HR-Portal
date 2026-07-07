import express from 'express';
import {
  getPolicyAcknowledments, getPendingForEmployee, getStats,
  createPolicyAcknowledgment, acknowledge, getPolicyAcknowledgment,
} from '../controllers/policyAcknowledgmentController.js';
import { protect, authorize } from '../middleware/auth.js';

const router = express.Router();

router.get('/', protect, getPolicyAcknowledments);
router.get('/pending', protect, getPendingForEmployee);
router.get('/stats', protect, getStats);
router.post('/', protect, authorize('superadmin', 'admin', 'hr'), createPolicyAcknowledgment);
router.post('/:id/acknowledge', protect, acknowledge);
router.get('/:id', protect, getPolicyAcknowledgment);

export default router;
