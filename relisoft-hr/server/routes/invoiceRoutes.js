import express from 'express';
import {
  getInvoices, getInvoice, createInvoice, updateInvoice,
  match, approve, pay, dispute,
} from '../controllers/invoiceController.js';
import { protect, authorize } from '../middleware/auth.js';

const router = express.Router();

router.get('/', protect, getInvoices);
router.get('/:id', protect, getInvoice);
router.post('/', protect, authorize('superadmin', 'admin', 'hr'), createInvoice);
router.put('/:id', protect, authorize('superadmin', 'admin', 'hr'), updateInvoice);
router.put('/:id/match', protect, authorize('superadmin', 'admin', 'hr'), match);
router.put('/:id/approve', protect, authorize('superadmin', 'admin', 'hr'), approve);
router.put('/:id/pay', protect, authorize('superadmin', 'admin', 'hr'), pay);
router.put('/:id/dispute', protect, authorize('superadmin', 'admin', 'hr'), dispute);

export default router;
