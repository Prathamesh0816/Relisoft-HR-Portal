import express from 'express';
import {
  getGoodsReceipts, getGoodsReceipt,
  createGoodsReceipt, receiveItems,
} from '../controllers/goodsReceiptController.js';
import { protect, authorize } from '../middleware/auth.js';

const router = express.Router();

router.get('/', protect, getGoodsReceipts);
router.get('/:id', protect, getGoodsReceipt);
router.post('/', protect, authorize('superadmin', 'admin', 'hr'), createGoodsReceipt);
router.put('/:id/receive', protect, authorize('superadmin', 'admin', 'hr'), receiveItems);

export default router;
