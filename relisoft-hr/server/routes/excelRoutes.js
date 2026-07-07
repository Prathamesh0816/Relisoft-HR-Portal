import express from 'express';
import {
  uploadExistingEmployees, uploadLeaveBalances,
  downloadEmployeeTemplate, downloadLeaveBalanceTemplate,
} from '../controllers/excelController.js';
import { protect, authorize } from '../middleware/auth.js';

const router = express.Router();

router.post('/upload-existing-employees', protect, authorize('superadmin', 'admin', 'hr'), uploadExistingEmployees);
router.post('/upload-leave-balances', protect, authorize('superadmin', 'admin', 'hr'), uploadLeaveBalances);
router.get('/template/employees', protect, authorize('superadmin', 'admin', 'hr'), downloadEmployeeTemplate);
router.get('/template/leave-balances', protect, authorize('superadmin', 'admin', 'hr'), downloadLeaveBalanceTemplate);

export default router;
