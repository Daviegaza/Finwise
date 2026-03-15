export interface Transaction {
  id: string;
  userId: string;
  amount: number;
  currency: string;
  category: TransactionCategory;
  description: string;
  date: string;
  type: 'income' | 'expense';
  tags?: string[];
  merchant?: string;
}

export type TransactionCategory =
  | 'housing' | 'food' | 'transport' | 'healthcare'
  | 'entertainment' | 'shopping' | 'education' | 'utilities'
  | 'insurance' | 'savings' | 'investment' | 'income'
  | 'freelance' | 'salary' | 'business' | 'other';

export interface Budget {
  id: string;
  userId: string;
  category: TransactionCategory;
  limit: number;
  currency: string;
  period: 'weekly' | 'monthly' | 'yearly';
  spent: number;
  color: string;
}

export interface FinancialGoal {
  id: string;
  name: string;
  targetAmount: number;
  currentAmount: number;
  targetDate: string;
  category: 'emergency' | 'retirement' | 'purchase' | 'vacation' | 'education' | 'other';
  currency: string;
}

export interface User {
  id: string;
  name: string;
  email: string;
  country: string;
  currency: string;
  monthlyIncome: number;
  financialGoals: FinancialGoal[];
  createdAt: string;
}

export interface Insight {
  id: string;
  type: 'warning' | 'success' | 'tip' | 'alert';
  title: string;
  message: string;
  category?: TransactionCategory;
  actionable: boolean;
  priority: 'high' | 'medium' | 'low';
  createdAt: string;
}

export interface CategorySummary {
  category: TransactionCategory;
  amount: number;
  percentage: number;
  transactionCount: number;
  trend: 'up' | 'down' | 'stable';
}

export interface MonthlyData {
  month: string;
  income: number;
  expenses: number;
  savings: number;
}

export interface FinancialSummary {
  totalIncome: number;
  totalExpenses: number;
  netSavings: number;
  savingsRate: number;
  topCategories: CategorySummary[];
  monthlyTrend: MonthlyData[];
  currency: string;
}

export interface AIMessage {
  role: 'user' | 'assistant';
  content: string;
  timestamp: string;
}

export interface Country {
  code: string;
  name: string;
  currency: string;
  currencySymbol: string;
  avgSavingsRate: number;
  taxRate: number;
}

export type ActivePage = 'dashboard' | 'transactions' | 'budget' | 'goals' | 'insights' | 'advisor' | 'settings';

export interface AppState {
  user: User | null;
  activePage: ActivePage;
  currency: string;
  currencySymbol: string;
}
