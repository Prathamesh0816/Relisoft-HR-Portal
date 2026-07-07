import express from 'express';
import {
  getAttendance, getMyAttendance, punchIn, punchOut, getAttendanceSummary, markAttendance,
  requestRegularization, getMyRegularizationRequests,
  getPendingRegularizationRequests, reviewRegularizationRequest,
} from '../controllers/attendanceController.js';
import { protect, authorize } from '../middleware/auth.js';

const router = express.Router();

router.get('/my-attendance', protect, getMyAttendance);
router.post('/punch-in', protect, punchIn);
router.post('/punch-out', protect, punchOut);
router.get('/regularize/my', protect, getMyRegularizationRequests);
router.get('/regularize/pending', protect, authorize('admin', 'hr'), getPendingRegularizationRequests);
router.post('/regularize', protect, requestRegularization);
router.put('/regularize/:id', protect, authorize('admin', 'hr'), reviewRegularizationRequest);
router.get('/summary', protect, getAttendanceSummary);
router.post('/mark', protect, authorize('admin', 'hr'), markAttendance);
router.get('/', protect, getAttendance);

export default router;
