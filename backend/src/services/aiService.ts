import { AIMessage, User } from '../types';
import { calculateFinancialSummary, generateInsights, store } from './financialService';

const HAS_API_KEY = !!(process.env.ANTHROPIC_API_KEY?.startsWith('sk-ant'));

export const COUNTRIES: Record<string, { name: string; currency: string; currencySymbol: string; avgSavingsRate: number; taxRate: number }> = {
  US: { name: 'United States',   currency: 'USD', currencySymbol: '$',    avgSavingsRate: 0.08, taxRate: 0.22 },
  KE: { name: 'Kenya',           currency: 'KES', currencySymbol: 'KSh',  avgSavingsRate: 0.12, taxRate: 0.30 },
  GB: { name: 'United Kingdom',  currency: 'GBP', currencySymbol: '£',    avgSavingsRate: 0.15, taxRate: 0.20 },
  NG: { name: 'Nigeria',         currency: 'NGN', currencySymbol: '₦',    avgSavingsRate: 0.10, taxRate: 0.24 },
  ZA: { name: 'South Africa',    currency: 'ZAR', currencySymbol: 'R',    avgSavingsRate: 0.11, taxRate: 0.25 },
  IN: { name: 'India',           currency: 'INR', currencySymbol: '₹',    avgSavingsRate: 0.18, taxRate: 0.30 },
  DE: { name: 'Germany',         currency: 'EUR', currencySymbol: '€',    avgSavingsRate: 0.17, taxRate: 0.19 },
  CA: { name: 'Canada',          currency: 'CAD', currencySymbol: 'C$',   avgSavingsRate: 0.12, taxRate: 0.15 },
  AU: { name: 'Australia',       currency: 'AUD', currencySymbol: 'A$',   avgSavingsRate: 0.10, taxRate: 0.19 },
  BR: { name: 'Brazil',          currency: 'BRL', currencySymbol: 'R$',   avgSavingsRate: 0.14, taxRate: 0.27 },
  GH: { name: 'Ghana',           currency: 'GHS', currencySymbol: 'GH₵',  avgSavingsRate: 0.09, taxRate: 0.25 },
  JP: { name: 'Japan',           currency: 'JPY', currencySymbol: '¥',    avgSavingsRate: 0.25, taxRate: 0.10 },
  SG: { name: 'Singapore',       currency: 'SGD', currencySymbol: 'S$',   avgSavingsRate: 0.30, taxRate: 0.09 },
  AE: { name: 'UAE',             currency: 'AED', currencySymbol: 'AED',  avgSavingsRate: 0.20, taxRate: 0.05 },
  EG: { name: 'Egypt',           currency: 'EGP', currencySymbol: 'E£',   avgSavingsRate: 0.08, taxRate: 0.22 },
};

function buildMockResponse(userMessage: string, userId: string, user: User): string {
  const summary = calculateFinancialSummary(userId);
  const insights = generateInsights(userId);
  const goals = store.goals.get(userId) || [];
  const budgets = store.budgets.get(userId) || [];
  const country = COUNTRIES[user.country] || COUNTRIES.US;
  const sym = country.currencySymbol;
  const msg = userMessage.toLowerCase();
  const savingsRate = summary.savingsRate.toFixed(1);
  const topCat = summary.topCategories[0];
  const topCatName = topCat?.category || 'housing';
  const topCatAmt = topCat ? sym + topCat.amount.toFixed(0) : 'N/A';
  const monthlyLeft = (summary.totalIncome - summary.totalExpenses).toFixed(0);
  const overBudget = budgets.filter(b => b.spent > b.limit);
  const highInsights = insights.filter(i => i.priority === 'high');

  if (msg.includes('saving') || msg.includes('savings rate')) {
    const nat = (country.avgSavingsRate * 100).toFixed(0);
    const better = summary.savingsRate >= country.avgSavingsRate * 100;
    return 'Your current savings rate is ' + savingsRate + '%, which is ' + (better ? 'above' : 'below') + ' the ' + country.name + ' national average of ' + nat + '%.\n\n' + (better ? 'Great work! You are saving ' + sym + monthlyLeft + '/month. To push even further, consider automating transfers to a high-yield savings account on payday.' : 'To improve, target the 50/30/20 rule: 50% needs, 30% wants, 20% savings. Your biggest expense category is ' + topCatName + ' at ' + topCatAmt + ' — reviewing that could free up meaningful cash each month.') + '\n\nA practical tip: even increasing your savings rate by 1% per month compounds significantly. At ' + sym + (summary.totalIncome * 0.01).toFixed(0) + '/month extra, you would add ' + sym + (summary.totalIncome * 0.01 * 12).toFixed(0) + '/year to your savings.';
  }

  if (msg.includes('spend') || msg.includes('expense') || msg.includes('analyz')) {
    const dailySpend = (summary.totalExpenses / 30).toFixed(2);
    return 'Here is your spending breakdown this month:\n\nYour top expense category is ' + topCatName + ' at ' + topCatAmt + ' (' + (topCat?.percentage.toFixed(0) || 0) + '% of total). Your daily average spend is ' + sym + dailySpend + '.\n\n' + (overBudget.length > 0 ? 'You have exceeded budget in ' + overBudget.length + ' categories. Focus on reducing discretionary spending in those areas first.' : 'You are within budget across all categories — solid financial discipline!') + '\n\nOne quick win: track every purchase for 7 days. Awareness alone reduces spending by 10-15% without any deliberate effort.';
  }

  if (msg.includes('goal') || msg.includes('track') || msg.includes('target')) {
    if (goals.length === 0) return 'You do not have any financial goals set yet!\n\nI would recommend:\n1. Emergency Fund — 3-6 months of expenses (' + sym + (summary.totalExpenses * 4).toFixed(0) + ' target)\n2. A short-term goal within 12 months\n3. Retirement — even ' + sym + (summary.totalIncome * 0.05).toFixed(0) + '/month invested becomes significant wealth over time\n\nGo to the Goals tab to set these up!';
    const closest = goals.reduce((a, b) => (b.currentAmount / b.targetAmount) > (a.currentAmount / a.targetAmount) ? b : a);
    const pct = ((closest.currentAmount / closest.targetAmount) * 100).toFixed(0);
    const daysLeft = Math.ceil((new Date(closest.targetDate).getTime() - Date.now()) / (1000 * 60 * 60 * 24));
    return 'You have ' + goals.length + ' active goals. Your best progress is on "' + closest.name + '" at ' + pct + '% complete!\n\n' + (daysLeft > 0 ? 'With ' + daysLeft + ' days left, you need ' + sym + ((closest.targetAmount - closest.currentAmount) / Math.max(daysLeft / 30, 1)).toFixed(0) + '/month to hit your target.' : 'This goal is past its target date — consider updating the deadline.') + '\n\nOverall you have saved ' + sym + goals.reduce((s, g) => s + g.currentAmount, 0).toFixed(0) + ' across all goals. Consistency beats intensity every time.';
  }

  if (msg.includes('invest') || msg.includes('stock') || msg.includes('fund')) {
    return 'Based on your current savings of ' + sym + monthlyLeft + '/month, here is a simple investment framework:\n\n1. Build a 3-6 month emergency fund first\n2. Then invest: 80% low-cost index funds, 20% bonds\n\n' + sym + (summary.totalIncome * 0.1).toFixed(0) + '/month invested at 8% average return = ' + sym + (summary.totalIncome * 0.1 * 12 * ((Math.pow(1.08, 20) - 1) / 0.08)).toFixed(0) + ' in 20 years.\n\nLook into locally available index funds for instant diversification with minimal fees.';
  }

  if (msg.includes('budget')) {
    return 'Your budget health this month:\n\n' + (overBudget.length === 0 ? 'All ' + budgets.length + ' budget categories are within limits — excellent!' : overBudget.length + ' of ' + budgets.length + ' budgets exceeded.') + '\n\nPro tip: Review budgets monthly and adjust. Build in a small "fun money" buffer (5-10%) to stay motivated long term.';
  }

  if (msg.includes('health') || msg.includes('report') || msg.includes('overview') || msg.includes('how am i')) {
    const score = summary.savingsRate >= 20 ? 'Excellent' : summary.savingsRate >= 10 ? 'Good' : 'Needs Attention';
    return 'Your Financial Health Report:\n\nIncome: ' + sym + summary.totalIncome.toFixed(0) + '\nExpenses: ' + sym + summary.totalExpenses.toFixed(0) + '\nSavings: ' + sym + summary.netSavings.toFixed(0) + ' (' + savingsRate + '% rate)\nStatus: ' + score + '\n\n' + (highInsights.length > 0 ? highInsights.length + ' high-priority issues need attention — check the Insights tab.' : 'No critical issues detected.') + '\n\nTop recommendation: ' + (summary.savingsRate < 20 ? 'Increase savings rate by ' + (20 - summary.savingsRate).toFixed(0) + '% to reach the 20% benchmark. Start by reviewing ' + topCatName + ' spending (' + topCatAmt + ').' : 'Keep your savings rate above 20% and focus on investing your surplus.');
  }

  return 'Based on your finances in ' + country.name + ':\n\nIncome: ' + sym + summary.totalIncome.toFixed(0) + ' | Expenses: ' + sym + summary.totalExpenses.toFixed(0) + ' | Savings rate: ' + savingsRate + '%\n\nYou can ask me about:\n- Savings strategies\n- Spending analysis\n- Goal progress\n- Investment basics\n- Budget review\n- Financial health report\n\nWhat would you like to explore?';
}

export async function getAIResponse(userId: string, messages: AIMessage[], user: User): Promise<string> {
  const lastUserMessage = [...messages].reverse().find(m => m.role === 'user');
  if (!lastUserMessage) return 'How can I help you with your finances today?';

  if (HAS_API_KEY) {
    try {
      const Anthropic = (await import('@anthropic-ai/sdk')).default;
      const client = new Anthropic();
      const summary = calculateFinancialSummary(userId);
      const country = COUNTRIES[user.country] || COUNTRIES.US;
      const sym = country.currencySymbol;
      const response = await client.messages.create({
        model: 'claude-opus-4-5',
        max_tokens: 600,
        system: 'You are FinWise AI, a warm expert financial advisor. User: ' + user.name + ' | Country: ' + country.name + ' | Income: ' + sym + summary.totalIncome.toFixed(0) + ' | Expenses: ' + sym + summary.totalExpenses.toFixed(0) + ' | Savings Rate: ' + summary.savingsRate.toFixed(1) + '%. Give concise personalized advice in 2-3 paragraphs using ' + sym + ' for currency.',
        messages: messages.map(m => ({ role: m.role as 'user' | 'assistant', content: m.content })),
      });
      const text = response.content.find(c => c.type === 'text');
      return text?.text || buildMockResponse(lastUserMessage.content, userId, user);
    } catch (err) {
      return buildMockResponse(lastUserMessage.content, userId, user);
    }
  }

  await new Promise(r => setTimeout(r, 600 + Math.random() * 800));
  return buildMockResponse(lastUserMessage.content, userId, user);
}

export async function generateAutoInsightNarrative(userId: string, user: User): Promise<string> {
  const summary = calculateFinancialSummary(userId);
  const country = COUNTRIES[user.country] || COUNTRIES.US;
  const sym = country.currencySymbol;
  const better = summary.savingsRate >= country.avgSavingsRate * 100;
  const topCat = summary.topCategories[0];
  return 'Your finances are ' + (better ? 'in strong shape' : 'showing room for growth') + ' this month with a ' + summary.savingsRate.toFixed(0) + '% savings rate' + (better ? ', putting you ahead of most people in ' + country.name : ', below the ' + country.name + ' average of ' + (country.avgSavingsRate * 100).toFixed(0) + '%') + '. ' + (topCat ? 'Your biggest opportunity is reviewing ' + topCat.category + ' spending (' + sym + topCat.amount.toFixed(0) + '), which makes up ' + topCat.percentage.toFixed(0) + '% of your expenses.' : 'Keep tracking your spending to unlock deeper insights.');
}