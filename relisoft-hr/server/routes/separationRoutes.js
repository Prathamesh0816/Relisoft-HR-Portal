import express from 'express';
import {
  getSeparations, getSeparation, initiateSeparation, updateClearanceStatus,
  completeSeparation, calculateSettlement, getMySeparation,
} from '../controllers/separationController.js';
import { protect, authorize } from '../middleware/auth.js';

const router = express.Router();

router.get('/my-separation', protect, getMySeparation);
router.get('/', protect, authorize('admin', 'hr'), getSeparations);
router.get('/:id', protect, getSeparation);
router.get('/:id/settlement', protect, calculateSettlement);
router.post('/', protect, initiateSeparation);
router.put('/:id/clearance', protect, authorize('admin', 'hr'), updateClearanceStatus);
router.put('/:id/complete', protect, authorize('admin', 'hr'), completeSeparation);

export default router;
