import express from 'express';
import {
  getMyCertifications, getEmployeeCertifications, createCertification,
  updateCertification, getExpiringCertifications,
} from '../controllers/certificationController.js';
import { protect, authorize } from '../middleware/auth.js';

const router = express.Router();

router.get('/expiring', protect, getExpiringCertifications);
router.get('/my', protect, getMyCertifications);
router.get('/:employeeId', protect, getEmployeeCertifications);
router.post('/', protect, authorize('admin', 'hr'), createCertification);
router.put('/:id', protect, authorize('admin', 'hr'), updateCertification);

export default router;
