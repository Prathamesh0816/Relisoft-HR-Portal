import express from 'express';
const router = express.Router();
import {
  getPlans,
  createPlan,
  updatePlan,
  enrollBenefit,
  getMyBenefits,
  getEnrolledEmployees,
  addDependent,
  getDependents,
} from '../controllers/benefitsController.js';

router.get('/plans', getPlans);
router.post('/plans', createPlan);
router.put('/plans/:id', updatePlan);
router.post('/enroll', enrollBenefit);
router.get('/my-benefits', getMyBenefits);
router.get('/admin/:planId', getEnrolledEmployees);
router.post('/dependents', addDependent);
router.get('/dependents/:employeeId', getDependents);

export default router;
