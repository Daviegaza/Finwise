import { v4 as uuidv4 } from 'uuid';
import {
  Transaction, Budget, User, FinancialSummary,
  CategorySummary, MonthlyData, Insight, TransactionCategory,
  FinancialGoal
} from '../types';

// In-memory store (replace with DB in production)
export const store: {
  users: Map<string, User>;
  transactions: Map<string, Transaction[]>;
  budgets: Map<string, Budget[]>;
  goals: Map<string, FinancialGoal[]>;
} = {
  users: new Map(),
  transactions: new Map(),
  budgets: new Map(),
  goals: new Map(),
};

// Seed demo data
export function seedDemoData(userId: string) {
  const now = new Date();
  const transactions: Transaction[] = [];

  const categories: { cat: TransactionCategory; type: 'income' | 'expense'; amountRange: [number, number]; descriptions: string[] }[] = [
    { cat: 'salary', type: 'income', amountRange: [3000, 5000], descriptions: ['Monthly Salary', 'Salary Payment'] },
    { cat: 'freelance', type: 'income', amountRange: [200, 800], descriptions: ['Freelance Project', 'Consulting Fee'] },
    { cat: 'food', type: 'expense', amountRange: [15, 120], descriptions: ['Grocery Shopping', 'Restaurant', 'Coffee Shop', 'Food Delivery', 'Supermarket'] },
    { cat: 'transport', type: 'expense', amountRange: [10, 80], descriptions: ['Uber', 'Bus Pass', 'Fuel', 'Taxi', 'Metro Card'] },
    { cat: 'housing', type: 'expense', amountRange: [800, 1500], descriptions: ['Monthly Rent', 'Mortgage Payment'] },
    { cat: 'entertainment', type: 'expense', amountRange: [10, 100], descriptions: ['Netflix', 'Spotify', 'Movie Tickets', 'Concert', 'Gaming'] },
    { cat: 'healthcare', type: 'expense', amountRange: [20, 200], descriptions: ['Pharmacy', 'Doctor Visit', 'Gym Membership', 'Dental'] },
    { cat: 'shopping', type: 'expense', amountRange: [30, 300], descriptions: ['Amazon', 'Clothes', 'Electronics', 'Books', 'Shoes'] },
    { cat: 'utilities', type: 'expense', amountRange: [50, 150], descriptions: ['Electricity Bill', 'Water Bill', 'Internet', 'Phone Bill'] },
    { cat: 'education', type: 'expense', amountRange: [20, 200], descriptions: ['Online Course', 'Books', 'Udemy', 'Coursera'] },
  ];

  for (let monthsBack = 5; monthsBack >= 0; monthsBack--) {
    const monthDate = new Date(now);
    monthDate.setMonth(monthDate.getMonth() - monthsBack);

    // Add salary
    transactions.push({
      id: uuidv4(),
      userId,
      amount: 4200 + Math.random() * 300,
      currency: 'USD',
      category: 'salary',
      description: 'Monthly Salary',
      date: new Date(monthDate.getFullYear(), monthDate.getMonth(), 1).toISOString(),
      type: 'income',
    });

    // Add freelance income some months
    if (Math.random() > 0.4) {
      transactions.push({
        id: uuidv4(),
        userId,
        amount: 200 + Math.random() * 600,
        currency: 'USD',
        category: 'freelance',
        description: 'Freelance Project',
        date: new Date(monthDate.getFullYear(), monthDate.getMonth(), Math.floor(Math.random() * 25) + 1).toISOString(),
        type: 'income',
      });
    }

    // Add expenses
    const expenseCats = categories.filter(c => c.type === 'expense');
    for (const cat of expenseCats) {
      const numTransactions = cat.cat === 'housing' ? 1 : Math.floor(Math.random() * 4) + 1;
      for (let i = 0; i < numTransactions; i++) {
        const [min, max] = cat.amountRange;
        transactions.push({
          id: uuidv4(),
          userId,
          amount: min + Math.random() * (max - min),
          currency: 'USD',
          category: cat.cat,
          description: cat.descriptions[Math.floor(Math.random() * cat.descriptions.length)],
          date: new Date(monthDate.getFullYear(), monthDate.getMonth(), Math.floor(Math.random() * 28) + 1).toISOString(),
          type: 'expense',
        });
      }
    }
  }

  store.transactions.set(userId, transactions);

  const budgets: Budget[] = [
    { id: uuidv4(), userId, category: 'food', limit: 400, currency: 'USD', period: 'monthly', spent: 0, color: '#F59E0B' },
    { id: uuidv4(), userId, category: 'transport', limit: 200, currency: 'USD', period: 'monthly', spent: 0, color: '#3B82F6' },
    { id: uuidv4(), userId, category: 'entertainment', limit: 150, currency: 'USD', period: 'monthly', spent: 0, color: '#8B5CF6' },
    { id: uuidv4(), userId, category: 'shopping', limit: 300, currency: 'USD', period: 'monthly', spent: 0, color: '#EC4899' },
    { id: uuidv4(), userId, category: 'healthcare', limit: 200, currency: 'USD', period: 'monthly', spent: 0, color: '#10B981' },
    { id: uuidv4(), userId, category: 'utilities', limit: 200, currency: 'USD', period: 'monthly', spent: 0, color: '#06B6D4' },
  ];
  store.budgets.set(userId, budgets);

  const goals: FinancialGoal[] = [
    {
      id: uuidv4(), name: 'Emergency Fund', targetAmount: 10000, currentAmount: 3200,
      targetDate: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString(),
      category: 'emergency', currency: 'USD'
    },
    {
      id: uuidv4(), name: 'Vacation to Japan', targetAmount: 5000, currentAmount: 1800,
      targetDate: new Date(Date.now() + 180 * 24 * 60 * 60 * 1000).toISOString(),
      category: 'vacation', currency: 'USD'
    },
    {
      id: uuidv4(), name: 'New Laptop', targetAmount: 2000, currentAmount: 950,
      targetDate: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000).toISOString(),
      category: 'purchase', currency: 'USD'
    },
  ];
  store.goals.set(userId, goals);
}

export function calculateFinancialSummary(userId: string, period: 'month' | 'quarter' | 'year' = 'month'): FinancialSummary {
  const transactions = store.transactions.get(userId) || [];
  const now = new Date();

  let startDate: Date;
  switch (period) {
    case 'quarter': startDate = new Date(now.getFullYear(), now.getMonth() - 3, 1); break;
    case 'year': startDate = new Date(now.getFullYear(), 0, 1); break;
    default: startDate = new Date(now.getFullYear(), now.getMonth(), 1);
  }

  const filtered = transactions.filter(t => new Date(t.date) >= startDate);

  const totalIncome = filtered.filter(t => t.type === 'income').reduce((sum, t) => sum + t.amount, 0);
  const totalExpenses = filtered.filter(t => t.type === 'expense').reduce((sum, t) => sum + t.amount, 0);
  const netSavings = totalIncome - totalExpenses;
  const savingsRate = totalIncome > 0 ? (netSavings / totalIncome) * 100 : 0;

  // Category breakdown
  const categoryMap = new Map<TransactionCategory, number>();
  const categoryCount = new Map<TransactionCategory, number>();
  filtered.filter(t => t.type === 'expense').forEach(t => {
    categoryMap.set(t.category, (categoryMap.get(t.category) || 0) + t.amount);
    categoryCount.set(t.category, (categoryCount.get(t.category) || 0) + 1);
  });

  const topCategories: CategorySummary[] = Array.from(categoryMap.entries())
    .map(([category, amount]) => ({
      category,
      amount,
      percentage: totalExpenses > 0 ? (amount / totalExpenses) * 100 : 0,
      transactionCount: categoryCount.get(category) || 0,
      trend: Math.random() > 0.5 ? 'up' : 'down' as 'up' | 'down',
    }))
    .sort((a, b) => b.amount - a.amount)
    .slice(0, 8);

  // Monthly trend (last 6 months)
  const monthlyTrend: MonthlyData[] = [];
  for (let i = 5; i >= 0; i--) {
    const monthStart = new Date(now.getFullYear(), now.getMonth() - i, 1);
    const monthEnd = new Date(now.getFullYear(), now.getMonth() - i + 1, 0);
    const monthTransactions = transactions.filter(t => {
      const d = new Date(t.date);
      return d >= monthStart && d <= monthEnd;
    });
    const income = monthTransactions.filter(t => t.type === 'income').reduce((s, t) => s + t.amount, 0);
    const expenses = monthTransactions.filter(t => t.type === 'expense').reduce((s, t) => s + t.amount, 0);
    monthlyTrend.push({
      month: monthStart.toLocaleString('default', { month: 'short', year: '2-digit' }),
      income,
      expenses,
      savings: income - expenses,
    });
  }

  return { totalIncome, totalExpenses, netSavings, savingsRate, topCategories, monthlyTrend, currency: 'USD' };
}

export function generateInsights(userId: string): Insight[] {
  const transactions = store.transactions.get(userId) || [];
  const budgets = store.budgets.get(userId) || [];
  const goals = store.goals.get(userId) || [];
  const insights: Insight[] = [];
  const now = new Date();
  const thisMonth = transactions.filter(t => {
    const d = new Date(t.date);
    return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
  });
  const lastMonth = transactions.filter(t => {
    const d = new Date(t.date);
    const lm = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    return d.getMonth() === lm.getMonth() && d.getFullYear() === lm.getFullYear();
  });

  const thisMonthExpenses = thisMonth.filter(t => t.type === 'expense').reduce((s, t) => s + t.amount, 0);
  const lastMonthExpenses = lastMonth.filter(t => t.type === 'expense').reduce((s, t) => s + t.amount, 0);

  if (lastMonthExpenses > 0 && thisMonthExpenses > lastMonthExpenses * 1.15) {
    insights.push({
      id: uuidv4(), type: 'warning',
      title: 'Spending Spike Detected',
      message: `Your spending is up ${((thisMonthExpenses / lastMonthExpenses - 1) * 100).toFixed(0)}% compared to last month. Review your expenses to stay on track.`,
      actionable: true, priority: 'high', createdAt: now.toISOString(),
    });
  }

  const foodExpenses = thisMonth.filter(t => t.category === 'food').reduce((s, t) => s + t.amount, 0);
  const foodBudget = budgets.find(b => b.category === 'food');
  if (foodBudget && foodExpenses > foodBudget.limit * 0.8) {
    insights.push({
      id: uuidv4(), type: 'alert',
      title: 'Food Budget Nearly Exceeded',
      message: `You've used ${((foodExpenses / foodBudget.limit) * 100).toFixed(0)}% of your food budget. Consider cooking at home more this week.`,
      category: 'food', actionable: true, priority: 'high', createdAt: now.toISOString(),
    });
  }

  const thisMonthIncome = thisMonth.filter(t => t.type === 'income').reduce((s, t) => s + t.amount, 0);
  const savingsRate = thisMonthIncome > 0 ? ((thisMonthIncome - thisMonthExpenses) / thisMonthIncome) * 100 : 0;
  if (savingsRate >= 20) {
    insights.push({
      id: uuidv4(), type: 'success',
      title: 'Excellent Savings Rate!',
      message: `You're saving ${savingsRate.toFixed(0)}% of your income this month. Financial experts recommend 20%+ — you're crushing it!`,
      actionable: false, priority: 'medium', createdAt: now.toISOString(),
    });
  } else if (savingsRate < 10 && thisMonthIncome > 0) {
    insights.push({
      id: uuidv4(), type: 'warning',
      title: 'Low Savings Rate',
      message: `Your savings rate is ${savingsRate.toFixed(0)}% this month. Try to reach at least 20% by reducing discretionary spending.`,
      actionable: true, priority: 'high', createdAt: now.toISOString(),
    });
  }

  goals.forEach(goal => {
    const progress = (goal.currentAmount / goal.targetAmount) * 100;
    const daysLeft = Math.ceil((new Date(goal.targetDate).getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
    const needed = goal.targetAmount - goal.currentAmount;
    const monthsLeft = daysLeft / 30;
    const monthlyNeeded = needed / Math.max(monthsLeft, 1);

    if (progress >= 90) {
      insights.push({
        id: uuidv4(), type: 'success',
        title: `Almost There: ${goal.name}`,
        message: `You're ${progress.toFixed(0)}% toward your ${goal.name} goal! Just $${needed.toFixed(0)} more to go.`,
        actionable: false, priority: 'medium', createdAt: now.toISOString(),
      });
    } else if (daysLeft < 60 && progress < 70) {
      insights.push({
        id: uuidv4(), type: 'alert',
        title: `Goal at Risk: ${goal.name}`,
        message: `${daysLeft} days left to reach your ${goal.name} goal. You need to save $${monthlyNeeded.toFixed(0)}/month to get there.`,
        actionable: true, priority: 'high', createdAt: now.toISOString(),
      });
    }
  });

  const subscriptions = thisMonth.filter(t => t.category === 'entertainment' && t.amount < 50);
  if (subscriptions.length >= 3) {
    insights.push({
      id: uuidv4(), type: 'tip',
      title: 'Subscription Audit Suggested',
      message: `You have ${subscriptions.length} subscription charges this month. Audit your subscriptions — the average person wastes $200+/year on unused services.`,
      category: 'entertainment', actionable: true, priority: 'low', createdAt: now.toISOString(),
    });
  }

  insights.push({
    id: uuidv4(), type: 'tip',
    title: '50/30/20 Budget Rule',
    message: 'Allocate 50% of income to needs, 30% to wants, and 20% to savings & investments for optimal financial health.',
    actionable: true, priority: 'low', createdAt: now.toISOString(),
  });

  return insights.sort((a, b) => {
    const priority = { high: 0, medium: 1, low: 2 };
    return priority[a.priority] - priority[b.priority];
  });
}

export function getOrCreateUser(userId: string): User {
  if (!store.users.has(userId)) {
    const user: User = {
      id: userId,
      name: 'Alex Johnson',
      email: 'alex@example.com',
      country: 'US',
      currency: 'USD',
      monthlyIncome: 4500,
      financialGoals: [],
      createdAt: new Date().toISOString(),
    };
    store.users.set(userId, user);
    seedDemoData(userId);
  }
  return store.users.get(userId)!;
}
