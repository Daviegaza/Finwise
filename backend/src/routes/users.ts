import { Router, Request, Response } from 'express';
import { store, getOrCreateUser } from '../services/financialService';

const router = Router();

router.get('/:userId', (req: Request, res: Response) => {
  const user = getOrCreateUser(req.params.userId);
  res.json({ user });
});

router.put('/:userId', (req: Request, res: Response) => {
  const { userId } = req.params;
  const user = getOrCreateUser(userId);
  const updated = { ...user, ...req.body, id: userId };
  store.users.set(userId, updated);
  res.json({ user: updated });
});

export default router;
