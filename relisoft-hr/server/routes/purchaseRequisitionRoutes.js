import express from 'express';
import {
  getPurchaseRequisitions, getPurchaseRequisition,
  createPurchaseRequisition, updatePurchaseRequisition,
  submit, approve, reject, convertToPO,
} from '../controllers/purchaseRequisitionController.js';
import { protect, authorize } from '../middleware/auth.js';

const router = express.Router();

router.get('/', protect, getPurchaseRequisitions);
router.get('/:id', protect, getPurchaseRequisition);
router.post('/', protect, createPurchaseRequisition);
router.put('/:id', protect, updatePurchaseRequisition);
router.put('/:id/submit', protect, submit);
router.put('/:id/approve', protect, authorize('superadmin', 'admin', 'hr'), approve);
router.put('/:id/reject', protect, authorize('superadmin', 'admin', 'hr'), reject);
router.post('/:id/convert-to-po', protect, authorize('superadmin', 'admin', 'hr'), convertToPO);

export default router;
