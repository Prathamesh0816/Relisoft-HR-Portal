import express from 'express';
import {
  getPurchaseOrders, getPurchaseOrder, createPurchaseOrder,
  updatePurchaseOrder, sendToVendor, receiveItems, cancel,
} from '../controllers/purchaseOrderController.js';
import { protect, authorize } from '../middleware/auth.js';

const router = express.Router();

router.get('/', protect, getPurchaseOrders);
router.get('/:id', protect, getPurchaseOrder);
router.post('/', protect, authorize('superadmin', 'admin', 'hr'), createPurchaseOrder);
router.put('/:id', protect, authorize('superadmin', 'admin', 'hr'), updatePurchaseOrder);
router.put('/:id/send', protect, authorize('superadmin', 'admin', 'hr'), sendToVendor);
router.put('/:id/receive', protect, authorize('superadmin', 'admin', 'hr'), receiveItems);
router.put('/:id/cancel', protect, authorize('superadmin', 'admin', 'hr'), cancel);

export default router;
