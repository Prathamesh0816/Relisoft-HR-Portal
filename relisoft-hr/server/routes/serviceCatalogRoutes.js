import express from 'express';
import {
  getServiceCatalogs, getByCategory, getServiceCatalog,
  createServiceCatalog, updateServiceCatalog, toggleActive, deleteServiceCatalog,
} from '../controllers/serviceCatalogController.js';
import { protect, authorize } from '../middleware/auth.js';

const router = express.Router();

router.get('/', protect, getServiceCatalogs);
router.get('/category/:category', protect, getByCategory);
router.get('/:id', protect, getServiceCatalog);
router.post('/', protect, authorize('superadmin', 'admin', 'hr'), createServiceCatalog);
router.put('/:id', protect, authorize('superadmin', 'admin', 'hr'), updateServiceCatalog);
router.put('/:id/toggle', protect, authorize('superadmin', 'admin', 'hr'), toggleActive);
router.delete('/:id', protect, authorize('superadmin', 'admin', 'hr'), deleteServiceCatalog);

export default router;
