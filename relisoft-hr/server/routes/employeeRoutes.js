import express from 'express';
import {
  getEmployees, getEmployee, createEmployee, updateEmployee, deleteEmployee,
  getEmployeeProfile, updateProfileImage, getReportingHierarchy,
} from '../controllers/employeeController.js';
import { protect, authorize } from '../middleware/auth.js';

const router = express.Router();

router.get('/profile', protect, getEmployeeProfile);
router.put('/profile-image', protect, updateProfileImage);
router.get('/hierarchy/:id', protect, getReportingHierarchy);
router.get('/', protect, authorize('admin', 'hr'), getEmployees);
router.get('/:id', protect, getEmployee);
router.post('/', protect, authorize('admin', 'hr'), createEmployee);
router.put('/:id', protect, authorize('admin', 'hr'), updateEmployee);
router.delete('/:id', protect, authorize('admin', 'hr'), deleteEmployee);

export default router;
