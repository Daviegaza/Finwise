import { Router, Request, Response } from 'express';
import { v4 as uuidv4 } from 'uuid';
import { store, getOrCreateUser, generateInsights, calculateFinancialSummary } from '../services/financialService';
import { Budget, FinancialGoal } from '../types';

export const budgetRouter = Router();
export const insightRouter = Router();

// Budgets
budgetRouter.get('/:userId', (req: Request, res: Response) => {
  const { userId } = req.params;
  getOrCreateUser(userId);
  const budgets = store.budgets.get(userId) || [];
  const transactions = store.transactions.get(userId) || [];
  const now = new Date();

  const budgetsWithSpent = budgets.map(b => {
    const spent = transactions
      .filter(t => {
        const d = new Date(t.date);
        return t.category === b.category && t.type === 'expense' &&
          d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
      })
      .reduce((s, t) => s + t.amount, 0);
    return { ...b, spent };
  });

  res.json({ budgets: budgetsWithSpent });
});

budgetRouter.post('/:userId', (req: Request, res: Response) => {
  const { userId } = req.params;
  getOrCreateUser(userId);
  const { category, limit, currency, period, color } = req.body;

  const budget: Budget = {
    id: uuidv4(), userId, category, limit: parseFloat(limit),
    currency: currency || 'USD', period: period || 'monthly',
    spent: 0, color: color || '#6366F1',
  };

  const existing = store.budgets.get(userId) || [];
  existing.push(budget);
  store.budgets.set(userId, existing);
  res.status(201).json({ budget });
});

budgetRouter.put('/:userId/:budgetId', (req: Request, res: Response) => {
  const { userId, budgetId } = req.params;
  const budgets = store.budgets.get(userId) || [];
  const idx = budgets.findIndex(b => b.id === budgetId);
  if (idx === -1) return res.status(404).json({ error: 'Budget not found' });
  budgets[idx] = { ...budgets[idx], ...req.body, id: budgetId };
  store.budgets.set(userId, budgets);
  res.json({ budget: budgets[idx] });
});

budgetRouter.delete('/:userId/:budgetId', (req: Request, res: Response) => {
  const { userId, budgetId } = req.params;
  const budgets = store.budgets.get(userId) || [];
  store.budgets.set(userId, budgets.filter(b => b.id !== budgetId));
  res.json({ success: true });
});

// Goals
budgetRouter.get('/:userId/goals', (req: Request, res: Response) => {
  const { userId } = req.params;
  getOrCreateUser(userId);
  res.json({ goals: store.goals.get(userId) || [] });
});

budgetRouter.post('/:userId/goals', (req: Request, res: Response) => {
  const { userId } = req.params;
  getOrCreateUser(userId);
  const goal: FinancialGoal = { id: uuidv4(), ...req.body };
  const existing = store.goals.get(userId) || [];
  existing.push(goal);
  store.goals.set(userId, existing);
  res.status(201).json({ goal });
});

budgetRouter.put('/:userId/goals/:goalId', (req: Request, res: Response) => {
  const { userId, goalId } = req.params;
  const goals = store.goals.get(userId) || [];
  const idx = goals.findIndex(g => g.id === goalId);
  if (idx === -1) return res.status(404).json({ error: 'Goal not found' });
  goals[idx] = { ...goals[idx], ...req.body, id: goalId };
  store.goals.set(userId, goals);
  res.json({ goal: goals[idx] });
});

// Insights
insightRouter.get('/:userId', (req: Request, res: Response) => {
  const { userId } = req.params;
  getOrCreateUser(userId);
  const insights = generateInsights(userId);
  res.json({ insights });
});

insightRouter.get('/:userId/summary', (req: Request, res: Response) => {
  const { userId } = req.params;
  const { period = 'month' } = req.query;
  getOrCreateUser(userId);
  const summary = calculateFinancialSummary(userId, period as 'month' | 'quarter' | 'year');
  res.json({ summary });
});
