import express from 'express';
import {
  getProfileChangeRequests, getMyRequests, getProfileChangeRequest,
  createProfileChangeRequest, approve, reject,
} from '../controllers/profileChangeRequestController.js';
import { protect, authorize } from '../middleware/auth.js';

const router = express.Router();

router.get('/', protect, getProfileChangeRequests);
router.get('/my', protect, getMyRequests);
router.get('/:id', protect, getProfileChangeRequest);
router.post('/', protect, createProfileChangeRequest);
router.put('/:id/approve', protect, authorize('superadmin', 'admin', 'hr'), approve);
router.put('/:id/reject', protect, authorize('superadmin', 'admin', 'hr'), reject);

export default router;
