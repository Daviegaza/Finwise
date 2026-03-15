import { useState, useEffect, useCallback, useRef } from 'react';
import { transactionApi, budgetApi, goalApi, insightApi, userApi, aiApi } from '../services/api';
import { Transaction, Budget, FinancialGoal, FinancialSummary, Insight, User, AIMessage } from '../types';

// ─── User Hook ────────────────────────────────────────────
export function useUser() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchUser = useCallback(async () => {
    try {
      const u = await userApi.get();
      setUser(u);
    } catch (e) {
      console.error('Failed to fetch user', e);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchUser(); }, [fetchUser]);

  const updateUser = async (data: Partial<User>) => {
    const updated = await userApi.update(data);
    setUser(updated);
    return updated;
  };

  return { user, loading, updateUser, refetch: fetchUser };
}

// ─── Summary Hook ─────────────────────────────────────────
export function useSummary(period: 'month' | 'quarter' | 'year' = 'month') {
  const [summary, setSummary] = useState<FinancialSummary | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchSummary = useCallback(async () => {
    setLoading(true);
    try {
      const s = await insightApi.summary(period);
      setSummary(s);
    } catch (e) {
      console.error('Failed to fetch summary', e);
    } finally {
      setLoading(false);
    }
  }, [period]);

  useEffect(() => { fetchSummary(); }, [fetchSummary]);

  return { summary, loading, refetch: fetchSummary };
}

// ─── Transactions Hook ────────────────────────────────────
export function useTransactions() {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState<{
    category?: string; type?: string; from?: string; to?: string;
    limit: number; offset: number;
  }>({ limit: 50, offset: 0 });

  const fetchTransactions = useCallback(async () => {
    setLoading(true);
    try {
      const result = await transactionApi.list(filters);
      setTransactions(result.transactions);
      setTotal(result.total);
    } catch (e) {
      console.error('Failed to fetch transactions', e);
    } finally {
      setLoading(false);
    }
  }, [filters]);

  useEffect(() => { fetchTransactions(); }, [fetchTransactions]);

  const addTransaction = async (data: Omit<Transaction, 'id' | 'userId'>) => {
    const t = await transactionApi.create(data);
    setTransactions(prev => [t, ...prev]);
    setTotal(prev => prev + 1);
    return t;
  };

  const deleteTransaction = async (id: string) => {
    await transactionApi.delete(id);
    setTransactions(prev => prev.filter(t => t.id !== id));
    setTotal(prev => prev - 1);
  };

  const updateTransaction = async (id: string, data: Partial<Transaction>) => {
    const updated = await transactionApi.update(id, data);
    setTransactions(prev => prev.map(t => t.id === id ? updated : t));
    return updated;
  };

  return {
    transactions, total, loading, filters, setFilters,
    addTransaction, deleteTransaction, updateTransaction, refetch: fetchTransactions,
  };
}

// ─── Budgets Hook ─────────────────────────────────────────
export function useBudgets() {
  const [budgets, setBudgets] = useState<Budget[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchBudgets = useCallback(async () => {
    setLoading(true);
    try {
      const b = await budgetApi.list();
      setBudgets(b);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchBudgets(); }, [fetchBudgets]);

  const addBudget = async (data: Omit<Budget, 'id' | 'userId' | 'spent'>) => {
    const b = await budgetApi.create(data);
    setBudgets(prev => [...prev, b]);
    return b;
  };

  const deleteBudget = async (id: string) => {
    await budgetApi.delete(id);
    setBudgets(prev => prev.filter(b => b.id !== id));
  };

  return { budgets, loading, addBudget, deleteBudget, refetch: fetchBudgets };
}

// ─── Goals Hook ───────────────────────────────────────────
export function useGoals() {
  const [goals, setGoals] = useState<FinancialGoal[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchGoals = useCallback(async () => {
    setLoading(true);
    try {
      const g = await goalApi.list();
      setGoals(g);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchGoals(); }, [fetchGoals]);

  const addGoal = async (data: Omit<FinancialGoal, 'id'>) => {
    const g = await goalApi.create(data);
    setGoals(prev => [...prev, g]);
    return g;
  };

  const updateGoal = async (id: string, data: Partial<FinancialGoal>) => {
    const updated = await goalApi.update(id, data);
    setGoals(prev => prev.map(g => g.id === id ? updated : g));
    return updated;
  };

  return { goals, loading, addGoal, updateGoal, refetch: fetchGoals };
}

// ─── Insights Hook ────────────────────────────────────────
export function useInsights() {
  const [insights, setInsights] = useState<Insight[]>([]);
  const [narrative, setNarrative] = useState<string>('');
  const [loading, setLoading] = useState(true);

  const fetchInsights = useCallback(async () => {
    setLoading(true);
    try {
      const [i, n] = await Promise.all([
        insightApi.list(),
        aiApi.narrative(),
      ]);
      setInsights(i);
      setNarrative(n);
    } catch (e) {
      console.error('Failed to fetch insights', e);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchInsights(); }, [fetchInsights]);

  return { insights, narrative, loading, refetch: fetchInsights };
}

// ─── AI Chat Hook ─────────────────────────────────────────
export function useAIChat() {
  const [messages, setMessages] = useState<AIMessage[]>([
    {
      role: 'assistant',
      content: "Hi! I'm your FinWise AI advisor 👋 I have access to your full financial profile — your spending patterns, budgets, and goals. Ask me anything: how to cut expenses, investment ideas, savings strategies, or just how you're doing financially. I'm here to help!",
      timestamp: new Date().toISOString(),
    }
  ]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const abortRef = useRef<AbortController | null>(null);

  const sendMessage = async (content: string) => {
    if (!content.trim() || loading) return;
    setError(null);

    const userMessage: AIMessage = { role: 'user', content, timestamp: new Date().toISOString() };
    const newMessages = [...messages, userMessage];
    setMessages(newMessages);
    setLoading(true);

    try {
      const result = await aiApi.chat(newMessages);
      const assistantMessage: AIMessage = {
        role: 'assistant',
        content: result.response,
        timestamp: result.timestamp,
      };
      setMessages(prev => [...prev, assistantMessage]);
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : 'Failed to get AI response';
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  const clearChat = () => {
    setMessages([{
      role: 'assistant',
      content: "Chat cleared! How can I help you with your finances today?",
      timestamp: new Date().toISOString(),
    }]);
    setError(null);
  };

  return { messages, loading, error, sendMessage, clearChat };
}
