import express from 'express';
const router = express.Router();
import {
  createForm,
  getForms,
  getForm,
  updateForm,
  submitForm,
  getSubmissions,
  getFormAnalytics,
  deleteForm,
} from '../controllers/smartFormController.js';

router.post('/', createForm);
router.get('/', getForms);
router.get('/:id', getForm);
router.put('/:id', updateForm);
router.delete('/:id', deleteForm);
router.post('/:id/submit', submitForm);
router.get('/:id/responses', getSubmissions);
router.get('/:id/analytics', getFormAnalytics);

export default router;
