import express from 'express';
import {
  getServiceRequests, getMyRequests, getServiceRequest,
  createServiceRequest, submitForApproval, approve, reject,
  fulfill, cancel, addComment,
} from '../controllers/serviceRequestController.js';
import { protect, authorize } from '../middleware/auth.js';

const router = express.Router();

router.get('/', protect, getServiceRequests);
router.get('/my', protect, getMyRequests);
router.get('/:id', protect, getServiceRequest);
router.post('/', protect, createServiceRequest);
router.put('/:id/submit', protect, submitForApproval);
router.put('/:id/approve', protect, authorize('superadmin', 'admin', 'hr'), approve);
router.put('/:id/reject', protect, authorize('superadmin', 'admin', 'hr'), reject);
router.put('/:id/fulfill', protect, authorize('superadmin', 'admin', 'hr', 'it'), fulfill);
router.put('/:id/cancel', protect, cancel);
router.post('/:id/comments', protect, addComment);

export default router;
