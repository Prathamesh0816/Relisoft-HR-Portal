import express from 'express';
const router = express.Router();
import {
  createCase,
  getCases,
  getCase,
  updateCase,
  assignInvestigator,
  resolveCase,
  addDocument,
  addTimelineEntry,
} from '../controllers/caseController.js';

router.post('/', createCase);
router.get('/', getCases);
router.get('/:id', getCase);
router.put('/:id', updateCase);
router.put('/:id/assign', assignInvestigator);
router.put('/:id/resolve', resolveCase);
router.post('/:id/documents', addDocument);
router.post('/:id/timeline', addTimelineEntry);

export default router;
