import express from 'express';
import {
  getLicenseAllocations, getByLicense, getByEmployee,
  allocate, revoke, deleteLicenseAllocation,
} from '../controllers/licenseAllocationController.js';
import { protect, authorize } from '../middleware/auth.js';

const router = express.Router();

router.get('/', protect, getLicenseAllocations);
router.get('/license/:license', protect, getByLicense);
router.get('/employee/:employee', protect, getByEmployee);
router.post('/allocate', protect, authorize('superadmin', 'admin', 'hr', 'it'), allocate);
router.put('/:id/revoke', protect, authorize('superadmin', 'admin', 'hr', 'it'), revoke);
router.delete('/:id', protect, authorize('superadmin', 'admin', 'hr', 'it'), deleteLicenseAllocation);

export default router;
