import express from 'express';
import {
  generateHRReport, generatePayrollReport, generateAttendanceReport,
  generateLeaveReport, generateComplianceReport, exportToCSV, exportToPDF,
} from '../controllers/reportController.js';
import { protect, authorize } from '../middleware/auth.js';

const router = express.Router();

router.post('/export/csv', protect, authorize('admin', 'hr'), exportToCSV);
router.post('/export/pdf', protect, authorize('admin', 'hr'), exportToPDF);
router.get('/hr', protect, authorize('admin', 'hr'), generateHRReport);
router.get('/payroll', protect, authorize('admin', 'hr', 'finance'), generatePayrollReport);
router.get('/attendance', protect, authorize('admin', 'hr'), generateAttendanceReport);
router.get('/leaves', protect, authorize('admin', 'hr'), generateLeaveReport);
router.get('/compliance', protect, authorize('admin', 'hr'), generateComplianceReport);

export default router;
