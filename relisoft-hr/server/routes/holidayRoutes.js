import express from 'express';
import { getHolidays, getHoliday, createHoliday, updateHoliday, deleteHoliday } from '../controllers/holidayController.js';
import { protect, authorize } from '../middleware/auth.js';

const router = express.Router();

router.get('/', protect, getHolidays);
router.get('/:id', protect, getHoliday);
router.post('/', protect, authorize('admin', 'hr'), createHoliday);
router.put('/:id', protect, authorize('admin', 'hr'), updateHoliday);
router.delete('/:id', protect, authorize('admin', 'hr'), deleteHoliday);

export default router;
