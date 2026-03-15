import React, { useState } from 'react';
import { Plus, Trash2, RotateCcw, CheckCircle2, Circle, Calendar } from 'lucide-react';
import { useHabits } from '../../hooks/useHabits';
import toast from 'react-hot-toast';

export default function HabitsPage() {
  const { habits, completedCount, completionPct, addHabit, removeHabit, toggleHabit, resetAll } = useHabits();
  const [newHabit, setNewHabit] = useState('');

  const handleAdd = () => {
    if (!newHabit.trim()) return;
    addHabit(newHabit.trim());
    setNewHabit('');
    toast.success('Habit added!');
  };

  const pctColor = completionPct >= 80 ? 'var(--success)' : completionPct >= 50 ? 'var(--warning)' : 'var(--danger)';

  return (
    <div className="flex flex-col gap-4 max-w-2xl">
      <div className="flex items-start justify-between flex-wrap gap-3">
        <div>
          <h2 className="section-title">Daily Habits</h2>
          <p className="section-subtitle">Build financial discipline one day at a time</p>
        </div>
        <button onClick={() => { resetAll(); toast.success('All habits reset'); }} className="btn-ghost flex items-center gap-2 text-sm py-2">
          <RotateCcw size={14} /> Reset All
        </button>
      </div>

      {/* Progress */}
      <div className="card p-5">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <Calendar size={16} style={{ color: 'var(--gold)' }} />
            <span className="font-semibold text-sm" style={{ color: 'var(--text-primary)' }}>Today's Progress</span>
          </div>
          <span className="text-2xl font-bold" style={{ color: pctColor, fontFamily: 'Fraunces, serif' }}>{completionPct}%</span>
        </div>
        <div className="h-2.5 rounded-full mb-2" style={{ background: 'rgba(255,255,255,0.07)' }}>
          <div className="h-full rounded-full transition-all duration-500" style={{ width: `${completionPct}%`, background: `linear-gradient(90deg, ${pctColor}88, ${pctColor})` }} />
        </div>
        <p className="text-xs" style={{ color: 'var(--text-muted)' }}>{completedCount} of {habits.length} habits completed today</p>
      </div>

      {/* Add habit */}
      <div className="card p-4 flex gap-3">
        <input className="input-field flex-1" placeholder="Add a new financial habit..." value={newHabit}
          onChange={e => setNewHabit(e.target.value)} onKeyDown={e => e.key === 'Enter' && handleAdd()} />
        <button onClick={handleAdd} className="btn-gold px-4 py-2 flex items-center gap-1.5 text-sm flex-shrink-0">
          <Plus size={15} /> Add
        </button>
      </div>

      {/* Habits list */}
      <div className="card overflow-hidden">
        {habits.length === 0 ? (
          <div className="p-16 text-center">
            <Calendar size={40} className="mx-auto mb-3 opacity-30" style={{ color: 'var(--gold)' }} />
            <p className="text-sm" style={{ color: 'var(--text-muted)' }}>No habits yet. Add some to get started!</p>
          </div>
        ) : (
          <div className="divide-y" style={{ borderColor: 'var(--border)' }}>
            {habits.map(habit => (
              <div key={habit.id} className="flex items-center gap-3 px-5 py-4 transition-colors"
                style={{ background: habit.done ? 'rgba(52,211,153,0.03)' : 'transparent' }}>
                <button onClick={() => toggleHabit(habit.id)} className="flex-shrink-0 transition-all">
                  {habit.done
                    ? <CheckCircle2 size={22} style={{ color: 'var(--success)' }} />
                    : <Circle size={22} style={{ color: 'var(--text-muted)' }} />}
                </button>
                <p className="flex-1 text-sm" style={{ color: habit.done ? 'var(--text-muted)' : 'var(--text-primary)', textDecoration: habit.done ? 'line-through' : 'none' }}>
                  {habit.text}
                </p>
                <button onClick={() => { removeHabit(habit.id); toast.success('Habit removed'); }}
                  className="w-7 h-7 rounded-lg flex items-center justify-center opacity-30 hover:opacity-100 transition-opacity flex-shrink-0"
                  style={{ color: 'var(--danger)' }}>
                  <Trash2 size={13} />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="card p-4" style={{ background: 'rgba(201,168,76,0.04)', border: '1px solid rgba(201,168,76,0.15)' }}>
        <p className="text-xs" style={{ color: 'var(--text-muted)' }}>
          💡 <strong style={{ color: 'var(--gold)' }}>Tip:</strong> Habits reset automatically each day. Consistency over time is what builds lasting financial health. Aim for 80%+ daily.
        </p>
      </div>
    </div>
  );
}
