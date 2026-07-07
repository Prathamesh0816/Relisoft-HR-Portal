import express from 'express';
import {
  getAlumni, getAlumniByEmployee, createAlumni,
  updateAlumni, getAlumniStats,
} from '../controllers/alumniController.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();

router.get('/stats', protect, getAlumniStats);
router.get('/', protect, getAlumni);
router.get('/:id', protect, getAlumniByEmployee);
router.post('/', protect, createAlumni);
router.put('/:id', protect, updateAlumni);

export default router;
