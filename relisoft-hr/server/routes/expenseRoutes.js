import express from 'express';
import {
  getExpenses, getMyExpenses, createExpense,
  updateExpenseStatus, getExpenseSummary,
} from '../controllers/expenseController.js';
import { protect, authorize } from '../middleware/auth.js';

const router = express.Router();

router.get('/summary', protect, getExpenseSummary);
router.get('/my', protect, getMyExpenses);
router.get('/', protect, getExpenses);
router.post('/', protect, createExpense);
router.put('/:id/status', protect, authorize('admin', 'manager', 'finance'), updateExpenseStatus);

export default router;
