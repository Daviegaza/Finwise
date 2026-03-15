import { Router, Request, Response } from 'express';
import { v4 as uuidv4 } from 'uuid';
import { store, getOrCreateUser } from '../services/financialService';
import { Transaction } from '../types';

const router = Router();

router.get('/:userId', (req: Request, res: Response) => {
  const { userId } = req.params;
  const { category, type, from, to, limit = '50', offset = '0' } = req.query;
  getOrCreateUser(userId);
  let transactions = store.transactions.get(userId) || [];

  if (category) transactions = transactions.filter(t => t.category === category);
  if (type) transactions = transactions.filter(t => t.type === type);
  if (from) transactions = transactions.filter(t => new Date(t.date) >= new Date(from as string));
  if (to) transactions = transactions.filter(t => new Date(t.date) <= new Date(to as string));

  transactions.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  const total = transactions.length;
  const paginated = transactions.slice(parseInt(offset as string), parseInt(offset as string) + parseInt(limit as string));

  res.json({ transactions: paginated, total, offset: parseInt(offset as string), limit: parseInt(limit as string) });
});

router.post('/:userId', (req: Request, res: Response) => {
  const { userId } = req.params;
  getOrCreateUser(userId);
  const { amount, currency, category, description, date, type, tags, merchant } = req.body;

  if (!amount || !category || !description || !type) {
    return res.status(400).json({ error: 'Missing required fields' });
  }

  const transaction: Transaction = {
    id: uuidv4(),
    userId,
    amount: parseFloat(amount),
    currency: currency || 'USD',
    category,
    description,
    date: date || new Date().toISOString(),
    type,
    tags: tags || [],
    merchant: merchant || '',
  };

  const existing = store.transactions.get(userId) || [];
  existing.unshift(transaction);
  store.transactions.set(userId, existing);
  res.status(201).json({ transaction });
});

router.put('/:userId/:transactionId', (req: Request, res: Response) => {
  const { userId, transactionId } = req.params;
  const transactions = store.transactions.get(userId) || [];
  const idx = transactions.findIndex(t => t.id === transactionId);
  if (idx === -1) return res.status(404).json({ error: 'Transaction not found' });

  transactions[idx] = { ...transactions[idx], ...req.body, id: transactionId, userId };
  store.transactions.set(userId, transactions);
  res.json({ transaction: transactions[idx] });
});

router.delete('/:userId/:transactionId', (req: Request, res: Response) => {
  const { userId, transactionId } = req.params;
  const transactions = store.transactions.get(userId) || [];
  const filtered = transactions.filter(t => t.id !== transactionId);
  store.transactions.set(userId, filtered);
  res.json({ success: true });
});

export default router;
