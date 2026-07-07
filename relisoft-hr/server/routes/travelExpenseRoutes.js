import express from 'express';
import {
  getRequests, getRequest, createRequest, updateRequestStatus,
  submitExpense, reimburseExpense, getMyRequests,
} from '../controllers/travelExpenseController.js';
import { protect, authorize } from '../middleware/auth.js';

const router = express.Router();

router.get('/my-requests', protect, getMyRequests);
router.get('/', protect, getRequests);
router.get('/:id', protect, getRequest);
router.post('/', protect, createRequest);
router.put('/:id/status', protect, authorize('admin', 'manager', 'finance'), updateRequestStatus);
router.post('/:id/expense', protect, submitExpense);
router.put('/expenses/:id/reimburse', protect, authorize('admin', 'finance'), reimburseExpense);

export default router;
