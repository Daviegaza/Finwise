import type { InvestmentCategory, InvestmentCategoryMeta, LocalInvestment, InvestmentSummary } from '../types';

export const INVESTMENT_META: Record<InvestmentCategory, InvestmentCategoryMeta> = {
  sacco:         { label: 'SACCO',            color: '#34D399', icon: '🏦', avgReturn: 12, riskLevel: 'low',    description: 'Savings & Credit Co-operative — dividends + loan access' },
  mmf:           { label: 'Money Market Fund', color: '#60A5FA', icon: '💹', avgReturn: 11, riskLevel: 'low',    description: 'CIC, Cytonn, Zimele — liquid, stable daily interest' },
  stocks:        { label: 'NSE Stocks',        color: '#A78BFA', icon: '📈', avgReturn: 15, riskLevel: 'high',   description: 'Nairobi Securities Exchange listed equities' },
  bonds:         { label: 'T-Bills / Bonds',   color: '#C9A84C', icon: '🏛️', avgReturn: 14, riskLevel: 'low',    description: 'Government-backed treasury bills and bonds' },
  realEstate:    { label: 'Real Estate / REITs',color: '#FB923C', icon: '🏘️', avgReturn: 13, riskLevel: 'medium', description: 'Property or REIT units (ILAM, Acorn)' },
  crypto:        { label: 'Crypto',            color: '#F59E0B', icon: '₿',  avgReturn: 20, riskLevel: 'high',   description: 'Bitcoin, ETH — high reward, very high risk' },
  pension:       { label: 'Pension / NSSF',    color: '#34D399', icon: '🌿', avgReturn: 10, riskLevel: 'low',    description: 'Retirement savings — NSSF voluntary top-ups' },
  savingsAccount:{ label: 'Savings Account',   color: '#54C5D0', icon: '💳', avgReturn:  6, riskLevel: 'low',    description: 'Bank savings account — low return, fully liquid' },
  fixedDeposit:  { label: 'Fixed Deposit',     color: '#7B82FF', icon: '🔒', avgReturn:  9, riskLevel: 'low',    description: 'Locked bank deposits for fixed terms' },
  other:         { label: 'Other',             color: '#94A3B8', icon: '🧩', avgReturn:  8, riskLevel: 'medium', description: 'Other investment vehicles' },
};

export const RISK_COLORS = {
  low:    { text: '#34D399', bg: 'rgba(52,211,153,0.12)'  },
  medium: { text: '#FBBF24', bg: 'rgba(251,191,36,0.12)'  },
  high:   { text: '#F87171', bg: 'rgba(248,113,113,0.12)' },
};

export const calculateInvestmentSummary = (investments: LocalInvestment[], month: string): InvestmentSummary => {
  const active = investments.filter(i => i.status !== 'withdrawn');
  const monthly = investments.filter(i => i.date.startsWith(month));
  const byCategory: Partial<Record<InvestmentCategory, number>> = {};
  let totalInvested = 0;
  let weightedReturn = 0;
  for (const inv of active) {
    byCategory[inv.category] = (byCategory[inv.category] || 0) + inv.amount;
    totalInvested += inv.amount;
    weightedReturn += inv.amount * (inv.expectedReturnPct / 100);
  }
  return {
    totalInvested, totalMonthly: monthly.reduce((s, i) => s + i.amount, 0),
    projectedAnnualReturn: weightedReturn,
    byCategory, activeCount: active.length,
  };
};

export const filterInvestmentsByMonth = (investments: LocalInvestment[], month: string) =>
  investments.filter(i => i.date.startsWith(month));

export const getCurrentMonth = () => {
  const now = new Date();
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
};

export const generateId = () => Math.random().toString(36).substring(2, 10) + Date.now().toString(36);
