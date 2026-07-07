import express from 'express';
import {
  applyLeave, approveLeaveFromEmail, getEmployeeRequests,
  getReviewerRequests, reviewLeave, cancelLeave, getLeaveBalanceForEmployee,
} from '../controllers/leaveController.js';
import { getLeaveReport } from '../controllers/leaveReportingController.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();

router.get('/employee/requests', protect, getEmployeeRequests);
router.get('/reviewer/requests', protect, getReviewerRequests);
router.get('/balance', protect, getLeaveBalanceForEmployee);
router.get('/approve', approveLeaveFromEmail);
router.get('/report', protect, getLeaveReport);
router.post('/apply', protect, applyLeave);
router.post('/reviewer/decision', protect, reviewLeave);
router.post('/:id/cancel', protect, cancelLeave);

export default router;
