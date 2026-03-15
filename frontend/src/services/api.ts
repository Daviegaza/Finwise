import { Transaction, Budget, FinancialGoal, FinancialSummary, Insight, User, AIMessage, Country } from '../types';

const BASE_URL = `${import.meta.env.VITE_API_URL || ''}/api`;
const USER_ID = 'demo-user';

async function request<T>(path: string, options?: RequestInit): Promise<T> {
  const res = await fetch(`${BASE_URL}${path}`, {
    headers: { 'Content-Type': 'application/json' },
    ...options,
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: 'Request failed' }));
    throw new Error(err.error || `HTTP ${res.status}`);
  }
  return res.json();
}

// ─── Users ───────────────────────────────────────────────
export const userApi = {
  get: () => request<{ user: User }>(`/users/${USER_ID}`).then(r => r.user),
  update: (data: Partial<User>) =>
    request<{ user: User }>(`/users/${USER_ID}`, {
      method: 'PUT', body: JSON.stringify(data),
    }).then(r => r.user),
};

// ─── Transactions ─────────────────────────────────────────
export const transactionApi = {
  list: (params?: { category?: string; type?: string; from?: string; to?: string; limit?: number; offset?: number }) => {
    const q = new URLSearchParams(params as Record<string, string> || {}).toString();
    return request<{ transactions: Transaction[]; total: number }>(`/transactions/${USER_ID}?${q}`);
  },
  create: (data: Omit<Transaction, 'id' | 'userId'>) =>
    request<{ transaction: Transaction }>(`/transactions/${USER_ID}`, {
      method: 'POST', body: JSON.stringify(data),
    }).then(r => r.transaction),
  update: (id: string, data: Partial<Transaction>) =>
    request<{ transaction: Transaction }>(`/transactions/${USER_ID}/${id}`, {
      method: 'PUT', body: JSON.stringify(data),
    }).then(r => r.transaction),
  delete: (id: string) =>
    request<{ success: boolean }>(`/transactions/${USER_ID}/${id}`, { method: 'DELETE' }),
};

// ─── Budgets ──────────────────────────────────────────────
export const budgetApi = {
  list: () => request<{ budgets: Budget[] }>(`/budgets/${USER_ID}`).then(r => r.budgets),
  create: (data: Omit<Budget, 'id' | 'userId' | 'spent'>) =>
    request<{ budget: Budget }>(`/budgets/${USER_ID}`, {
      method: 'POST', body: JSON.stringify(data),
    }).then(r => r.budget),
  update: (id: string, data: Partial<Budget>) =>
    request<{ budget: Budget }>(`/budgets/${USER_ID}/${id}`, {
      method: 'PUT', body: JSON.stringify(data),
    }).then(r => r.budget),
  delete: (id: string) =>
    request<{ success: boolean }>(`/budgets/${USER_ID}/${id}`, { method: 'DELETE' }),
};

// ─── Goals ────────────────────────────────────────────────
export const goalApi = {
  list: () => request<{ goals: FinancialGoal[] }>(`/budgets/${USER_ID}/goals`).then(r => r.goals),
  create: (data: Omit<FinancialGoal, 'id'>) =>
    request<{ goal: FinancialGoal }>(`/budgets/${USER_ID}/goals`, {
      method: 'POST', body: JSON.stringify(data),
    }).then(r => r.goal),
  update: (id: string, data: Partial<FinancialGoal>) =>
    request<{ goal: FinancialGoal }>(`/budgets/${USER_ID}/goals/${id}`, {
      method: 'PUT', body: JSON.stringify(data),
    }).then(r => r.goal),
};

// ─── Insights ─────────────────────────────────────────────
export const insightApi = {
  list: () => request<{ insights: Insight[] }>(`/insights/${USER_ID}`).then(r => r.insights),
  summary: (period?: 'month' | 'quarter' | 'year') =>
    request<{ summary: FinancialSummary }>(`/insights/${USER_ID}/summary?period=${period || 'month'}`).then(r => r.summary),
};

// ─── AI ───────────────────────────────────────────────────
export const aiApi = {
  chat: (messages: AIMessage[]) =>
    request<{ response: string; timestamp: string }>(`/ai/chat`, {
      method: 'POST', body: JSON.stringify({ userId: USER_ID, messages }),
    }),
  narrative: () =>
    request<{ narrative: string }>(`/ai/narrative/${USER_ID}`).then(r => r.narrative),
  countries: () =>
    request<{ countries: Country[] }>(`/ai/countries`).then(r => r.countries),
};
