import express from 'express';
import {
  initiateFnF, getFnFBySeparation, updateFnF, approveFnF,
  disburseFnF, getPendingFnF, getMyFnF, updateClearance,
} from '../controllers/fnfController.js';
import { protect, authorize } from '../middleware/auth.js';

const router = express.Router();

router.get('/pending', protect, authorize('admin', 'hr'), getPendingFnF);
router.get('/my', protect, getMyFnF);
router.post('/initiate/:separationId', protect, authorize('admin', 'hr'), initiateFnF);
router.get('/:separationId', protect, getFnFBySeparation);
router.put('/:id', protect, authorize('admin', 'hr'), updateFnF);
router.put('/:id/approve', protect, authorize('admin', 'hr'), approveFnF);
router.put('/:id/disburse', protect, authorize('admin', 'finance'), disburseFnF);
router.put('/:id/clearance', protect, authorize('admin', 'hr', 'it'), updateClearance);

export default router;
