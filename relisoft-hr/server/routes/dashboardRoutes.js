import express from 'express';
import {
  getHRSnapshot, getManagerDashboard, getEmployeeDashboard, getAdminDashboard,
} from '../controllers/dashboardController.js';
import { protect, authorize } from '../middleware/auth.js';

const router = express.Router();

router.get('/hr-snapshot', protect, getHRSnapshot);
router.get('/manager', protect, authorize('manager'), getManagerDashboard);
router.get('/employee', protect, getEmployeeDashboard);
router.get('/admin', protect, authorize('admin'), getAdminDashboard);

export default router;
