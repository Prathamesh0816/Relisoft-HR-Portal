import express from 'express';
import {
  getServiceCategories, getServiceCategory, createServiceCategory,
  updateServiceCategory, deleteServiceCategory,
} from '../controllers/serviceCategoryController.js';
import { protect, authorize } from '../middleware/auth.js';

const router = express.Router();

router.get('/', protect, getServiceCategories);
router.get('/:id', protect, getServiceCategory);
router.post('/', protect, authorize('superadmin', 'admin', 'hr'), createServiceCategory);
router.put('/:id', protect, authorize('superadmin', 'admin', 'hr'), updateServiceCategory);
router.delete('/:id', protect, authorize('superadmin', 'admin', 'hr'), deleteServiceCategory);

export default router;
