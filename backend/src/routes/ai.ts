import { Router, Request, Response } from 'express';
import { getAIResponse, generateAutoInsightNarrative, COUNTRIES } from '../services/aiService';
import { getOrCreateUser } from '../services/financialService';
import { AIMessage } from '../types';

const router = Router();

router.post('/chat', async (req: Request, res: Response) => {
  try {
    const { userId = 'demo-user', messages } = req.body;
    if (!messages || !Array.isArray(messages)) {
      return res.status(400).json({ error: 'Messages array required' });
    }
    const user = getOrCreateUser(userId);
    const response = await getAIResponse(userId, messages as AIMessage[], user);
    res.json({ response, timestamp: new Date().toISOString() });
  } catch (error) {
    console.error('AI chat error:', error);
    res.status(500).json({ error: 'AI service error' });
  }
});

router.get('/narrative/:userId', async (req: Request, res: Response) => {
  try {
    const { userId } = req.params;
    const user = getOrCreateUser(userId);
    const narrative = await generateAutoInsightNarrative(userId, user);
    res.json({ narrative });
  } catch (error) {
    console.error('Narrative error:', error);
    res.status(500).json({ error: 'Could not generate narrative' });
  }
});

router.get('/countries', (_req: Request, res: Response) => {
  const countries = Object.entries(COUNTRIES).map(([code, info]) => ({
    code,
    ...info,
  }));
  res.json({ countries });
});

export default router;
