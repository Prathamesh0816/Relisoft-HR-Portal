import express from 'express';
const router = express.Router();
import {
  getPlans,
  createPlan,
  updatePlan,
  deletePlan,
  getForecasts,
  createForecast,
  updateForecast,
  getDashboard,
  getGapAnalysis,
} from '../controllers/workforceController.js';

router.get('/', getPlans);
router.post('/', createPlan);
router.get('/dashboard', getDashboard);
router.get('/gap-analysis', getGapAnalysis);
router.get('/forecasts', getForecasts);
router.post('/forecasts', createForecast);
router.put('/forecasts/:id', updateForecast);
router.put('/plans/:id', updatePlan);
router.delete('/plans/:id', deletePlan);

export default router;
