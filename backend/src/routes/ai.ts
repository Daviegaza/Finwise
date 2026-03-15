import { Router, Request, Response } from 'express';
import { getAIResponse, generateAutoInsightNarrative, COUNTRIES } from '../services/aiService';
import { getOrCreateUser } from '../services/financialService';
import { AIMessage } from '../types';

const router = Router();

router.post('/chat', async (req: Request, res: Response) => {
  try {
    const { userId = 'demo-user', messages } = req.body;
    if (!messages || !Array.isArray(messages)) return res.status(400).json({ error: 'Messages array required' });
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
    res.status(500).json({ error: 'Could not generate narrative' });
  }
});

router.get('/countries', (_req: Request, res: Response) => {
  res.json({ countries: Object.entries(COUNTRIES).map(([code, info]) => ({ code, ...info })) });
});

// ─── Receipt Scanner ──────────────────────────────────────
router.post('/scan-receipt', async (req: Request, res: Response) => {
  try {
    const { imageBase64, mediaType = 'image/jpeg' } = req.body;
    if (!imageBase64) return res.status(400).json({ error: 'imageBase64 required' });

    const HAS_KEY = !!(process.env.ANTHROPIC_API_KEY?.startsWith('sk-ant'));
    if (!HAS_KEY) {
      // Mock response when no API key
      return res.json({
        merchant: 'Unknown Merchant',
        total: 0,
        date: new Date().toISOString().slice(0, 10),
        items: [],
        category: 'shopping',
        raw: 'No API key configured. Please add ANTHROPIC_API_KEY to backend .env',
      });
    }

    const Anthropic = (await import('@anthropic-ai/sdk')).default;
    const client = new Anthropic();
    const response = await client.messages.create({
      model: 'claude-opus-4-5',
      max_tokens: 1000,
      messages: [{
        role: 'user',
        content: [
          { type: 'image', source: { type: 'base64', media_type: mediaType as any, data: imageBase64 } },
          { type: 'text', text: `Analyze this receipt and respond ONLY with valid JSON, no markdown:
{"merchant":"store name","total":0.00,"date":"YYYY-MM-DD","items":[{"name":"item","amount":0.00}],"category":"food","raw":"brief summary"}
Category must be one of: housing|food|transport|healthcare|entertainment|shopping|education|utilities|other
If date unclear use today. Always return valid JSON.` }
        ]
      }]
    });

    const text = response.content.find(c => c.type === 'text')?.text || '';
    const json = text.match(/\{[\s\S]*\}/)?.[0];
    if (!json) return res.status(422).json({ error: 'Could not parse receipt' });

    const result = JSON.parse(json);
    if (!result.date || result.date === 'YYYY-MM-DD') result.date = new Date().toISOString().slice(0, 10);
    res.json(result);
  } catch (error: any) {
    console.error('Receipt scan error:', error);
    res.status(500).json({ error: error.message || 'Receipt scan failed' });
  }
});

// ─── AI Budget Generator ──────────────────────────────────
router.post('/generate-budget', async (req: Request, res: Response) => {
  try {
    const { income, lifestyle, priority, dependants, location, hasDebt, savingsGoal, currencySymbol = '$' } = req.body;
    if (!income) return res.status(400).json({ error: 'income required' });

    const HAS_KEY = !!(process.env.ANTHROPIC_API_KEY?.startsWith('sk-ant'));
    if (!HAS_KEY) {
      // Smart rule-based budget when no API key
      const inc = parseFloat(income);
      const savPct = parseFloat(savingsGoal) / 100 || 0.2;
      const plan = {
        categories: [
          { category: 'housing', limit: Math.round(inc * 0.30), reason: '30% rule for housing' },
          { category: 'food', limit: Math.round(inc * 0.15), reason: 'Groceries and dining' },
          { category: 'transport', limit: Math.round(inc * 0.10), reason: 'Commute and travel' },
          { category: 'utilities', limit: Math.round(inc * 0.05), reason: 'Bills and internet' },
          { category: 'healthcare', limit: Math.round(inc * 0.05), reason: 'Medical and gym' },
          { category: 'entertainment', limit: Math.round(inc * 0.05), reason: 'Fun and leisure' },
          { category: 'shopping', limit: Math.round(inc * 0.05), reason: 'Clothes and personal' },
          { category: 'education', limit: Math.round(inc * 0.03), reason: 'Learning and growth' },
          { category: 'savings', limit: Math.round(inc * savPct), reason: `${(savPct*100).toFixed(0)}% savings target` },
        ],
        savingsTarget: Math.round(inc * savPct),
        tips: [
          'Automate your savings on payday — pay yourself first',
          'Track every expense for 30 days to find hidden leaks',
          'Review subscriptions monthly and cancel unused ones',
          `In ${location}, housing costs can be negotiated — consider roommates to reduce costs`,
          hasDebt ? 'Allocate extra to highest-interest debt first (avalanche method)' : 'Build 3-6 month emergency fund before investing',
        ],
        summary: `Based on your ${currencySymbol}${inc.toLocaleString()} income with ${lifestyle.toLowerCase()} lifestyle in ${location}, this budget allocates ${(savPct*100).toFixed(0)}% to savings. Focus on your priority: ${priority}.`,
      };
      return res.json(plan);
    }

    const Anthropic = (await import('@anthropic-ai/sdk')).default;
    const client = new Anthropic();
    const response = await client.messages.create({
      model: 'claude-opus-4-5',
      max_tokens: 1500,
      messages: [{
        role: 'user',
        content: `You are a financial advisor. Generate a monthly budget. Respond ONLY with valid JSON, no markdown.

Income: ${currencySymbol}${income}/month | Location: ${location} | Lifestyle: ${lifestyle}
Priority: ${priority} | Dependants: ${dependants} | Has debt: ${hasDebt} | Savings goal: ${savingsGoal}%

{"categories":[{"category":"housing","limit":0,"reason":"brief"},{"category":"food","limit":0,"reason":"brief"},{"category":"transport","limit":0,"reason":"brief"},{"category":"utilities","limit":0,"reason":"brief"},{"category":"healthcare","limit":0,"reason":"brief"},{"category":"entertainment","limit":0,"reason":"brief"},{"category":"shopping","limit":0,"reason":"brief"},{"category":"education","limit":0,"reason":"brief"},{"category":"savings","limit":0,"reason":"brief"}],"savingsTarget":0,"tips":["tip1","tip2","tip3","tip4","tip5"],"summary":"2-3 sentences"}`
      }]
    });

    const text = response.content.find(c => c.type === 'text')?.text || '';
    const json = text.match(/\{[\s\S]*\}/)?.[0];
    if (!json) return res.status(422).json({ error: 'Could not generate budget' });
    res.json(JSON.parse(json));
  } catch (error: any) {
    console.error('Budget gen error:', error);
    res.status(500).json({ error: error.message || 'Budget generation failed' });
  }
});

export default router;
