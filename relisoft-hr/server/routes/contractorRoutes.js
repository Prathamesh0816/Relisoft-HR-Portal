import express from 'express';
const router = express.Router();
import {
  createVendor,
  getVendors,
  updateVendor,
  createContractor,
  getContractors,
  getContractor,
  updateContractor,
  logTime,
  getTimeLogs,
} from '../controllers/contractorController.js';

router.post('/vendors', createVendor);
router.get('/vendors', getVendors);
router.put('/vendors/:id', updateVendor);
router.post('/', createContractor);
router.get('/', getContractors);
router.get('/:id', getContractor);
router.put('/:id', updateContractor);
router.post('/:id/time-logs', logTime);
router.get('/:id/time-logs', getTimeLogs);

export default router;
