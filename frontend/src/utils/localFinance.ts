import type { LocalExpense, MonthlyBreakdown, InvestmentAdvice } from '../types';

export const generateId = () => Math.random().toString(36).substring(2, 10) + Date.now().toString(36);

export const getCurrentMonth = () => {
  const now = new Date();
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
};

export const filterByMonth = (expenses: LocalExpense[], month: string) =>
  expenses.filter(e => e.date.startsWith(month));

export const formatKES = (amount: number): string =>
  `KSh ${Math.abs(amount).toLocaleString('en-KE', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`;

export const EXPENSE_CATEGORY_META: Record<string, { label: string; type: 'necessary'|'unnecessary'; color: string; icon: string }> = {
  housing:       { label: 'Housing / Rent',    type: 'necessary',   color: '#4E9AF1', icon: '🏠' },
  food:          { label: 'Groceries / Food',  type: 'necessary',   color: '#56C596', icon: '🛒' },
  transport:     { label: 'Transport',         type: 'necessary',   color: '#7B82FF', icon: '🚌' },
  utilities:     { label: 'Utilities',         type: 'necessary',   color: '#54C5D0', icon: '💡' },
  medical:       { label: 'Medical / Health',  type: 'necessary',   color: '#F87C7C', icon: '🏥' },
  education:     { label: 'Education',         type: 'necessary',   color: '#FFA55A', icon: '📚' },
  entertainment: { label: 'Entertainment',     type: 'unnecessary', color: '#E879F9', icon: '🎬' },
  diningOut:     { label: 'Dining Out',        type: 'unnecessary', color: '#FB923C', icon: '🍽️' },
  shopping:      { label: 'Shopping',          type: 'unnecessary', color: '#F472B6', icon: '🛍️' },
  subscriptions: { label: 'Subscriptions',     type: 'unnecessary', color: '#A78BFA', icon: '📱' },
  impulse:       { label: 'Impulse Buys',      type: 'unnecessary', color: '#F43F5E', icon: '⚡' },
  other:         { label: 'Other',             type: 'necessary',   color: '#94A3B8', icon: '📦' },
};

export const calculateMonthlyBreakdown = (expenses: LocalExpense[], income: number): MonthlyBreakdown => {
  const byCategory: Partial<Record<string, number>> = {};
  let necessaryTotal = 0, unnecessaryTotal = 0;
  for (const exp of expenses) {
    byCategory[exp.category] = (byCategory[exp.category] || 0) + exp.amount;
    if (EXPENSE_CATEGORY_META[exp.category]?.type === 'necessary') necessaryTotal += exp.amount;
    else unnecessaryTotal += exp.amount;
  }
  return {
    totalExpenses: necessaryTotal + unnecessaryTotal, necessaryTotal, unnecessaryTotal,
    byCategory: byCategory as any, savingsLeft: Math.max(0, income - necessaryTotal - unnecessaryTotal),
  };
};

export const getInvestmentAdvice = (income: number): InvestmentAdvice => {
  let emergencyPct: number, savingsPct: number, investPct: number, tips: string[];
  if (income <= 20000) {
    emergencyPct = 0.05; savingsPct = 0.10; investPct = 0.05;
    tips = ['Start a SACCO account — they offer dividends and emergency loans.','Even KSh 500/month in M-Shwari compounds over time.','Cut one unnecessary expense to unlock savings.','Target building a KSh 50,000 emergency cushion first.','Consider side hustles to increase income before aggressive investing.'];
  } else if (income <= 50000) {
    emergencyPct = 0.08; savingsPct = 0.15; investPct = 0.10;
    tips = ['Open a Money Market Fund (e.g., Cytonn, CIC) for better returns than banks.','Aim to cover 3 months of expenses in your emergency fund.','Consider T-Bills and T-Bonds for low-risk government-backed returns.','Track every shilling — awareness changes behavior.','Automate savings on payday before you can spend it.'];
  } else if (income <= 100000) {
    emergencyPct = 0.10; savingsPct = 0.15; investPct = 0.15;
    tips = ['Diversify: split investments between MMFs, REITs, and NSE stocks.','Your emergency fund target: 6 months of living expenses.','Consider NHIF voluntary contributions for better health coverage.','Review your subscriptions — cut ones you use less than 3x/week.','Explore unit trusts for passive wealth-building.'];
  } else {
    emergencyPct = 0.10; savingsPct = 0.20; investPct = 0.20;
    tips = ['At this income, diversification is critical: stocks, bonds, real estate.','Max out your pension/NSSF voluntary contributions (tax efficient).','Consider hiring a certified financial planner for personalized strategy.','Real estate investment trusts (REITs) offer exposure to property.','Keep lifestyle inflation in check — income growth ≠ spend growth.'];
  }
  const emergency = Math.round(income * emergencyPct);
  const savings = Math.round(income * savingsPct);
  const investment = Math.round(income * investPct);
  return { emergencyFund: emergency, savings, investment, living: income - emergency - savings - investment, tips };
};
