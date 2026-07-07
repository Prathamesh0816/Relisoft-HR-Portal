import express from 'express';
import {
  getHeadcountAnalytics, getAttritionAnalytics, getPayrollAnalytics,
  getAttendanceAnalytics, getLeaveAnalytics, getRecruitmentAnalytics,
} from '../controllers/analyticsController.js';
import { protect, authorize } from '../middleware/auth.js';

const router = express.Router();

router.get('/headcount', protect, authorize('admin', 'hr'), getHeadcountAnalytics);
router.get('/attrition', protect, authorize('admin', 'hr'), getAttritionAnalytics);
router.get('/payroll', protect, authorize('admin', 'hr', 'finance'), getPayrollAnalytics);
router.get('/attendance', protect, authorize('admin', 'hr'), getAttendanceAnalytics);
router.get('/leaves', protect, authorize('admin', 'hr'), getLeaveAnalytics);
router.get('/recruitment', protect, authorize('admin', 'hr'), getRecruitmentAnalytics);

export default router;
