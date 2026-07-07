import express from 'express';
import {
  getWorkflows, getWorkflow, createWorkflow, updateWorkflow,
  toggleStatus, processStage,
} from '../controllers/workflowController.js';
import { protect, authorize } from '../middleware/auth.js';

const router = express.Router();

router.get('/', protect, getWorkflows);
router.get('/:id', protect, getWorkflow);
router.post('/', protect, authorize('admin'), createWorkflow);
router.put('/:id', protect, authorize('admin'), updateWorkflow);
router.put('/:id/toggle', protect, authorize('admin'), toggleStatus);
router.put('/:id/stage', protect, authorize('admin'), processStage);

export default router;
