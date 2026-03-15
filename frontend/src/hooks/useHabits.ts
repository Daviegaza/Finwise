import { useState, useCallback } from 'react';
import type { Habit } from '../types';
import { generateId } from '../utils/investments';

const KEY = 'finwise_habits';
const TODAY = () => new Date().toISOString().slice(0, 10);
const DEFAULTS: Omit<Habit, 'id'>[] = [
  { text: 'Check FinWise dashboard', done: false, createdAt: new Date().toISOString() },
  { text: 'Log every expense (no matter how small)', done: false, createdAt: new Date().toISOString() },
  { text: 'Avoid impulse purchases — apply the 48-hour rule', done: false, createdAt: new Date().toISOString() },
  { text: 'Check upcoming bills due this week', done: false, createdAt: new Date().toISOString() },
  { text: 'Move savings to MMF / SACCO on payday', done: false, createdAt: new Date().toISOString() },
];

const load = (): Habit[] => {
  try {
    const data = JSON.parse(localStorage.getItem(KEY) || 'null');
    if (!data) return DEFAULTS.map(h => ({ ...h, id: generateId() }));
    const today = TODAY();
    return data.map((h: Habit) => h.lastResetDate !== today && h.done ? { ...h, done: false, lastResetDate: today } : h);
  } catch { return DEFAULTS.map(h => ({ ...h, id: generateId() })); }
};

export const useHabits = () => {
  const [habits, setHabits] = useState<Habit[]>(load);
  const save = (updated: Habit[]) => { setHabits(updated); localStorage.setItem(KEY, JSON.stringify(updated)); };

  const addHabit = useCallback((text: string) => save([...habits, { id: generateId(), text: text.trim(), done: false, createdAt: new Date().toISOString() }]), [habits]);
  const removeHabit = useCallback((id: string) => save(habits.filter(h => h.id !== id)), [habits]);
  const toggleHabit = useCallback((id: string) => save(habits.map(h => h.id === id ? { ...h, done: !h.done, lastResetDate: TODAY() } : h)), [habits]);
  const resetAll = useCallback(() => save(habits.map(h => ({ ...h, done: false, lastResetDate: TODAY() }))), [habits]);

  const completedCount = habits.filter(h => h.done).length;
  const completionPct = habits.length > 0 ? Math.round((completedCount / habits.length) * 100) : 0;

  return { habits, completedCount, completionPct, addHabit, removeHabit, toggleHabit, resetAll };
};
