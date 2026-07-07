import express from 'express';
import { getRoles, getRole, createRole, updateRole, deleteRole } from '../controllers/roleController.js';
import { protect, authorize } from '../middleware/auth.js';

const router = express.Router();

router.get('/', protect, getRoles);
router.get('/:id', protect, getRole);
router.post('/', protect, authorize('admin'), createRole);
router.put('/:id', protect, authorize('admin'), updateRole);
router.delete('/:id', protect, authorize('admin'), deleteRole);

export default router;
