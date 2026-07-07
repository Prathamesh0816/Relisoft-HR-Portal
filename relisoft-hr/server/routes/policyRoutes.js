import express from 'express';
import {
  getPolicies, getActive, getPolicy, createPolicy,
  updatePolicy, archive, deletePolicy,
} from '../controllers/policyController.js';
import { protect, authorize } from '../middleware/auth.js';

const router = express.Router();

router.get('/', protect, getPolicies);
router.get('/active', protect, getActive);
router.get('/:id', protect, getPolicy);
router.post('/', protect, authorize('superadmin', 'admin', 'hr'), createPolicy);
router.put('/:id', protect, authorize('superadmin', 'admin', 'hr'), updatePolicy);
router.put('/:id/archive', protect, authorize('superadmin', 'admin', 'hr'), archive);
router.delete('/:id', protect, authorize('superadmin', 'admin', 'hr'), deletePolicy);

export default router;
