import { useState, useCallback, useMemo } from 'react';
import type { LocalInvestment, InvestmentStatus } from '../types';
import { generateId, getCurrentMonth, calculateInvestmentSummary, filterInvestmentsByMonth } from '../utils/investments';

const KEY = 'finwise_investments';
const load = (): LocalInvestment[] => { try { return JSON.parse(localStorage.getItem(KEY) || '[]'); } catch { return []; } };

export const useLocalInvestments = () => {
  const [investments, setInvestments] = useState<LocalInvestment[]>(load);
  const [selectedMonth, setSelectedMonth] = useState(getCurrentMonth());
  const save = (updated: LocalInvestment[]) => { setInvestments(updated); localStorage.setItem(KEY, JSON.stringify(updated)); };

  const addInvestment = useCallback((data: Omit<LocalInvestment, 'id'>) => save([...investments, { ...data, id: generateId() }]), [investments]);
  const removeInvestment = useCallback((id: string) => save(investments.filter(i => i.id !== id)), [investments]);
  const updateStatus = useCallback((id: string, status: InvestmentStatus) => save(investments.map(i => i.id === id ? { ...i, status } : i)), [investments]);

  const monthlyInvestments = useMemo(() => filterInvestmentsByMonth(investments, selectedMonth), [investments, selectedMonth]);
  const summary = useMemo(() => calculateInvestmentSummary(investments, selectedMonth), [investments, selectedMonth]);

  return { investments, monthlyInvestments, selectedMonth, setSelectedMonth, summary, addInvestment, removeInvestment, updateStatus };
};
