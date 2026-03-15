// ─── Existing FinWise types ───────────────────────────────
export interface Transaction {
  id: string; userId: string; amount: number; currency: string;
  category: TransactionCategory; description: string; date: string;
  type: 'income' | 'expense'; tags?: string[]; merchant?: string;
}
export type TransactionCategory =
  | 'housing' | 'food' | 'transport' | 'healthcare' | 'entertainment'
  | 'shopping' | 'education' | 'utilities' | 'insurance' | 'savings'
  | 'investment' | 'income' | 'freelance' | 'salary' | 'business' | 'other';
export interface Budget {
  id: string; userId: string; category: TransactionCategory; limit: number;
  currency: string; period: 'weekly' | 'monthly' | 'yearly'; spent: number; color: string;
}
export interface User {
  id: string; name: string; email: string; country: string; currency: string;
  monthlyIncome: number; financialGoals: FinancialGoal[]; createdAt: string;
}
export interface FinancialGoal {
  id: string; name: string; targetAmount: number; currentAmount: number;
  targetDate: string; category: 'emergency'|'retirement'|'purchase'|'vacation'|'education'|'other'; currency: string;
}
export interface Insight {
  id: string; type: 'warning'|'success'|'tip'|'alert'; title: string; message: string;
  category?: TransactionCategory; actionable: boolean; priority: 'high'|'medium'|'low'; createdAt: string;
}
export interface FinancialSummary {
  totalIncome: number; totalExpenses: number; netSavings: number; savingsRate: number;
  topCategories: CategorySummary[]; monthlyTrend: MonthlyData[]; currency: string;
}
export interface CategorySummary {
  category: TransactionCategory; amount: number; percentage: number;
  transactionCount: number; trend: 'up'|'down'|'stable';
}
export interface MonthlyData { month: string; income: number; expenses: number; savings: number; }
export interface AIMessage { role: 'user'|'assistant'; content: string; timestamp: string; }
export interface Country {
  code: string; name: string; currency: string; currencySymbol: string;
  avgSavingsRate?: number; taxRate?: number;
}

// ─── Routing ──────────────────────────────────────────────
export type ActivePage =
  | 'dashboard' | 'transactions' | 'budget' | 'goals' | 'insights'
  | 'advisor' | 'settings' | 'bills' | 'networth' | 'investments'
  | 'emergency' | 'habits' | 'alerts';

// ─── Bills ────────────────────────────────────────────────
export type BillCategory = 'rent'|'electricity'|'water'|'internet'|'phone'|'insurance'|'subscription'|'loan'|'tv'|'other';
export type BillFrequency = 'weekly'|'monthly'|'quarterly'|'annually';
export type BillStatus = 'upcoming'|'paid'|'overdue';
export interface Bill {
  id: string; name: string; amount: number; category: BillCategory;
  dueDay: number; frequency: BillFrequency; status: BillStatus;
  lastPaidDate?: string; notes: string; isRecurring: boolean;
}
export interface BillCategoryMeta { label: string; icon: string; color: string; }

// ─── Investments ──────────────────────────────────────────
export type InvestmentCategory = 'sacco'|'mmf'|'stocks'|'bonds'|'realEstate'|'crypto'|'pension'|'savingsAccount'|'fixedDeposit'|'other';
export type InvestmentStatus = 'active'|'matured'|'withdrawn';
export interface LocalInvestment {
  id: string; name: string; amount: number; category: InvestmentCategory;
  date: string; expectedReturnPct: number; notes: string; status: InvestmentStatus; isRecurring: boolean;
}
export interface InvestmentCategoryMeta {
  label: string; color: string; icon: string; avgReturn: number;
  riskLevel: 'low'|'medium'|'high'; description: string;
}
export interface InvestmentSummary {
  totalInvested: number; totalMonthly: number; projectedAnnualReturn: number;
  byCategory: Partial<Record<InvestmentCategory, number>>; activeCount: number;
}

// ─── Goals (local) ────────────────────────────────────────
export type GoalCategory = 'emergency'|'vacation'|'education'|'property'|'car'|'business'|'retirement'|'wedding'|'other';
export interface LocalGoal {
  id: string; name: string; targetAmount: number; savedAmount: number;
  category: GoalCategory; deadline: string; monthlyContribution: number;
  notes: string; createdAt: string; completed: boolean;
}
export interface GoalCategoryMeta { label: string; icon: string; color: string; description: string; }

// ─── Net Worth ────────────────────────────────────────────
export type AssetCategory = 'cash'|'investments'|'property'|'vehicle'|'crypto'|'pension'|'business'|'other';
export type LiabilityCategory = 'mortgage'|'carLoan'|'personalLoan'|'creditCard'|'studentLoan'|'other';
export interface NetWorthItem {
  id: string; name: string; amount: number;
  category: AssetCategory | LiabilityCategory; type: 'asset'|'liability'; notes: string;
}

// ─── Auth ─────────────────────────────────────────────────
export interface UserProfile { name: string; email: string; pin: string; createdAt: string; }

// ─── Habits ───────────────────────────────────────────────
export interface Habit {
  id: string; text: string; done: boolean; createdAt: string; lastResetDate?: string;
}

// ─── Emergency Fund ───────────────────────────────────────
export interface EmergencyFundData {
  currentAmount: number; targetMonths: number; lastUpdated: string;
  contributions: { id: string; amount: number; date: string; note: string }[];
}

// ─── Alerts ───────────────────────────────────────────────
export interface AlertContact { name: string; email: string; whatsapp: string; phone: string; }
export interface AlertLog {
  id: string; channel: 'email'|'whatsapp'|'phone'; timestamp: string; snapshot: string;
}

// ─── Local expense tracker ────────────────────────────────
export type ExpenseCategory = 'housing'|'food'|'transport'|'utilities'|'medical'|'education'|'entertainment'|'diningOut'|'shopping'|'subscriptions'|'impulse'|'other';
export type ExpenseType = 'necessary'|'unnecessary';
export interface LocalExpense {
  id: string; name: string; amount: number; category: ExpenseCategory;
  type: ExpenseType; date: string; isRecurring: boolean;
}
export interface FinancialProfile { monthlyIncome: number; currency: string; }
export interface MonthlyBreakdown {
  totalExpenses: number; necessaryTotal: number; unnecessaryTotal: number;
  byCategory: Partial<Record<ExpenseCategory, number>>; savingsLeft: number;
}
export interface InvestmentAdvice {
  emergencyFund: number; savings: number; investment: number; living: number; tips: string[];
}
