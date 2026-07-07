import express from 'express';
import {
  getJobs, getJob, createJob, updateJob, closeJob,
  addApplicant, updateApplicantStatus, scheduleInterview, getDashboardStats,
} from '../controllers/recruitmentController.js';
import { protect, authorize } from '../middleware/auth.js';

const router = express.Router();

router.get('/dashboard-stats', protect, getDashboardStats);
router.get('/', protect, getJobs);
router.get('/:id', protect, getJob);
router.post('/', protect, authorize('admin', 'hr'), createJob);
router.put('/:id', protect, authorize('admin', 'hr'), updateJob);
router.put('/:id/close', protect, authorize('admin', 'hr'), closeJob);
router.post('/:jobId/applicants', protect, addApplicant);
router.put('/applicants/:id/status', protect, authorize('admin', 'hr'), updateApplicantStatus);
router.put('/applicants/:id/schedule-interview', protect, authorize('admin', 'hr'), scheduleInterview);

export default router;
