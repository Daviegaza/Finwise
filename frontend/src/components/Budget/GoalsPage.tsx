import React, { useState } from 'react';
import { Plus, X, Target, Plane, ShoppingBag, GraduationCap, Briefcase, Shield } from 'lucide-react';
import { useGoals } from '../../hooks';
import { FinancialGoal } from '../../types';
import { formatCurrency, getDaysLeft } from '../../utils/categories';

const GOAL_ICONS: Record<string, React.ComponentType<{ size?: number; style?: React.CSSProperties }>> = {
  emergency: Shield, vacation: Plane, purchase: ShoppingBag,
  education: GraduationCap, retirement: Briefcase, other: Target,
};

const GOAL_COLORS: Record<string, string> = {
  emergency: '#34D399', vacation: '#60A5FA', purchase: '#F472B6',
  education: '#A78BFA', retirement: '#FBBF24', other: '#C9A84C',
};

function GoalCard({ goal, currencySymbol, onContribute }: {
  goal: FinancialGoal; currencySymbol: string;
  onContribute: (id: string, amount: number) => void;
}) {
  const [adding, setAdding] = useState(false);
  const [amount, setAmount] = useState('');
  const pct = Math.min((goal.currentAmount / goal.targetAmount) * 100, 100);
  const daysLeft = getDaysLeft(goal.targetDate);
  const remaining = goal.targetAmount - goal.currentAmount;
  const monthlyNeeded = remaining / Math.max(daysLeft / 30, 1);
  const Icon = GOAL_ICONS[goal.category] || Target;
  const color = GOAL_COLORS[goal.category] || 'var(--gold)';
  const completed = pct >= 100;

  const handleContribute = () => {
    if (!amount || parseFloat(amount) <= 0) return;
    onContribute(goal.id, parseFloat(amount));
    setAmount('');
    setAdding(false);
  };

  return (
    <div className="card p-5 group relative overflow-hidden">
      {completed && (
        <div className="absolute top-3 right-3">
          <span className="badge badge-success">🎉 Complete!</span>
        </div>
      )}

      {/* Glow */}
      <div className="absolute top-0 right-0 w-32 h-32 rounded-full opacity-5 -translate-y-1/2 translate-x-1/2"
        style={{ background: color, filter: 'blur(24px)' }} />

      <div className="flex items-start gap-4 mb-4">
        <div className="w-12 h-12 rounded-2xl flex items-center justify-center flex-shrink-0"
          style={{ background: `${color}18` }}>
          <Icon size={22} style={{ color }} />
        </div>
        <div className="flex-1 min-w-0">
          <h3 className="font-bold text-base mb-0.5 truncate" style={{ color: 'var(--text-primary)', fontFamily: 'Fraunces, serif' }}>
            {goal.name}
          </h3>
          <p className="text-xs" style={{ color: 'var(--text-muted)' }}>
            {completed ? 'Goal reached! 🎊' : daysLeft > 0 ? `${daysLeft} days left` : 'Overdue'}
          </p>
        </div>
      </div>

      {/* Progress */}
      <div className="mb-3">
        <div className="flex justify-between text-xs mb-1.5">
          <span style={{ color: 'var(--text-muted)' }}>Progress</span>
          <span className="font-medium" style={{ color }}>{pct.toFixed(0)}%</span>
        </div>
        <div className="progress-bar" style={{ height: '6px' }}>
          <div className="progress-fill" style={{ width: `${pct}%`, background: `linear-gradient(90deg, ${color}99, ${color})` }} />
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 gap-3 mb-4">
        <div className="p-2.5 rounded-xl" style={{ background: 'rgba(255,255,255,0.03)' }}>
          <p className="text-xs mb-0.5" style={{ color: 'var(--text-muted)' }}>Saved</p>
          <p className="text-sm font-bold" style={{ color }}>{formatCurrency(goal.currentAmount, currencySymbol)}</p>
        </div>
        <div className="p-2.5 rounded-xl" style={{ background: 'rgba(255,255,255,0.03)' }}>
          <p className="text-xs mb-0.5" style={{ color: 'var(--text-muted)' }}>Target</p>
          <p className="text-sm font-bold" style={{ color: 'var(--text-primary)' }}>{formatCurrency(goal.targetAmount, currencySymbol)}</p>
        </div>
      </div>

      {!completed && (
        <p className="text-xs mb-4" style={{ color: 'var(--text-muted)' }}>
          Need {formatCurrency(monthlyNeeded, currencySymbol)}/month to reach goal
        </p>
      )}

      {/* Contribute */}
      {!completed && (
        adding ? (
          <div className="flex gap-2">
            <input className="input-field flex-1 text-sm py-2" type="number" placeholder="Amount"
              value={amount} onChange={e => setAmount(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && handleContribute()} autoFocus />
            <button onClick={handleContribute} className="btn-gold px-3 py-2 text-xs">Add</button>
            <button onClick={() => setAdding(false)} className="btn-ghost p-2 rounded-xl"><X size={14} /></button>
          </div>
        ) : (
          <button onClick={() => setAdding(true)}
            className="w-full py-2 rounded-xl text-xs font-medium transition-all duration-200 border"
            style={{ borderColor: color + '40', color, background: color + '0D' }}
            onMouseEnter={e => (e.currentTarget as HTMLElement).style.background = color + '18'}
            onMouseLeave={e => (e.currentTarget as HTMLElement).style.background = color + '0D'}>
            + Contribute
          </button>
        )
      )}
    </div>
  );
}

function AddGoalModal({ onClose, onAdd, currency }: {
  onClose: () => void;
  onAdd: (g: Omit<FinancialGoal, 'id'>) => Promise<FinancialGoal>;
  currency: string;
}) {
  const [form, setForm] = useState({
    name: '', targetAmount: '', currentAmount: '0',
    targetDate: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    category: 'other' as FinancialGoal['category'],
  });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await onAdd({
        name: form.name, currency,
        targetAmount: parseFloat(form.targetAmount),
        currentAmount: parseFloat(form.currentAmount) || 0,
        targetDate: new Date(form.targetDate).toISOString(),
        category: form.category,
      });
      onClose();
    } finally { setLoading(false); }
  };

  const CATS: FinancialGoal['category'][] = ['emergency', 'vacation', 'purchase', 'education', 'retirement', 'other'];

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4"
      style={{ background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(8px)' }}>
      <div className="w-full max-w-md card p-6 animate-fade-slide-up">
        <div className="flex items-center justify-between mb-6">
          <h3 className="font-bold text-lg" style={{ fontFamily: 'Fraunces, serif' }}>New Goal</h3>
          <button onClick={onClose} className="btn-ghost p-1.5 rounded-lg"><X size={18} /></button>
        </div>
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div>
            <label className="label">Goal Name</label>
            <input className="input-field" placeholder="e.g. Emergency Fund, Dream Vacation..."
              value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} required />
          </div>

          <div>
            <label className="label">Category</label>
            <div className="grid grid-cols-3 gap-2">
              {CATS.map(c => {
                const Icon = GOAL_ICONS[c] || Target;
                const color = GOAL_COLORS[c] || 'var(--gold)';
                return (
                  <button key={c} type="button" onClick={() => setForm(f => ({ ...f, category: c }))}
                    className="flex flex-col items-center gap-1.5 p-2.5 rounded-xl text-xs font-medium capitalize transition-all duration-200 border"
                    style={{
                      background: form.category === c ? `${color}18` : 'rgba(255,255,255,0.03)',
                      borderColor: form.category === c ? `${color}50` : 'var(--border)',
                      color: form.category === c ? color : 'var(--text-muted)',
                    }}>
                    <Icon size={16} style={{ color: form.category === c ? color : 'var(--text-muted)' }} />
                    {c}
                  </button>
                );
              })}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="label">Target Amount</label>
              <input className="input-field" type="number" step="0.01" min="0" placeholder="0.00"
                value={form.targetAmount} onChange={e => setForm(f => ({ ...f, targetAmount: e.target.value }))} required />
            </div>
            <div>
              <label className="label">Already Saved</label>
              <input className="input-field" type="number" step="0.01" min="0" placeholder="0.00"
                value={form.currentAmount} onChange={e => setForm(f => ({ ...f, currentAmount: e.target.value }))} />
            </div>
          </div>

          <div>
            <label className="label">Target Date</label>
            <input className="input-field" type="date" value={form.targetDate}
              onChange={e => setForm(f => ({ ...f, targetDate: e.target.value }))} />
          </div>

          <div className="flex gap-3 pt-2">
            <button type="button" onClick={onClose} className="btn-ghost flex-1 py-3">Cancel</button>
            <button type="submit" disabled={loading} className="btn-gold flex-1 py-3">
              {loading ? 'Creating...' : 'Create Goal'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default function GoalsPage({ currencySymbol, currency }: { currencySymbol: string; currency: string }) {
  const { goals, loading, addGoal, updateGoal } = useGoals();
  const [showModal, setShowModal] = useState(false);

  const handleContribute = async (id: string, amount: number) => {
    const goal = goals.find(g => g.id === id);
    if (!goal) return;
    await updateGoal(id, { currentAmount: Math.min(goal.currentAmount + amount, goal.targetAmount) });
  };

  const totalTarget = goals.reduce((s, g) => s + g.targetAmount, 0);
  const totalSaved = goals.reduce((s, g) => s + g.currentAmount, 0);
  const completed = goals.filter(g => g.currentAmount >= g.targetAmount).length;

  return (
    <div className="flex flex-col gap-5">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h2 className="section-title">Financial Goals</h2>
          <p className="section-subtitle">{goals.length} goals · {completed} completed</p>
        </div>
        <button onClick={() => setShowModal(true)} className="btn-gold flex items-center gap-2 flex-shrink-0">
          <Plus size={16} /> <span className="hidden sm:inline">New Goal</span>
        </button>
      </div>

      {/* Summary */}
      {goals.length > 0 && (
        <div className="card p-5">
          <div className="flex items-center justify-between mb-3">
            <div>
              <p className="text-sm font-semibold" style={{ color: 'var(--text-secondary)' }}>Overall Progress</p>
              <p className="text-2xl font-bold gold-text" style={{ fontFamily: 'Fraunces, serif' }}>
                {formatCurrency(totalSaved, currencySymbol)} <span className="text-base font-normal text-opacity-60">/ {formatCurrency(totalTarget, currencySymbol)}</span>
              </p>
            </div>
            <div className="text-right">
              <p className="text-2xl font-bold" style={{ color: 'var(--gold)', fontFamily: 'Fraunces, serif' }}>
                {totalTarget > 0 ? ((totalSaved / totalTarget) * 100).toFixed(0) : 0}%
              </p>
              <p className="text-xs" style={{ color: 'var(--text-muted)' }}>saved overall</p>
            </div>
          </div>
          <div className="progress-bar" style={{ height: '8px' }}>
            <div className="progress-fill" style={{ width: `${totalTarget > 0 ? (totalSaved / totalTarget) * 100 : 0}%` }} />
          </div>
        </div>
      )}

      {loading ? (
        <div className="grid sm:grid-cols-2 gap-4">
          {[...Array(3)].map((_, i) => <div key={i} className="card p-5 h-56 skeleton" />)}
        </div>
      ) : goals.length === 0 ? (
        <div className="card p-12 text-center">
          <p className="text-4xl mb-4">🎯</p>
          <p className="font-semibold text-lg mb-2" style={{ fontFamily: 'Fraunces, serif' }}>Set your first goal</p>
          <p className="text-sm mb-6" style={{ color: 'var(--text-muted)' }}>Define financial goals and track your progress toward them</p>
          <button onClick={() => setShowModal(true)} className="btn-gold">Create First Goal</button>
        </div>
      ) : (
        <div className="grid sm:grid-cols-2 gap-4">
          {goals.map(g => (
            <GoalCard key={g.id} goal={g} currencySymbol={currencySymbol} onContribute={handleContribute} />
          ))}
        </div>
      )}

      {showModal && <AddGoalModal onClose={() => setShowModal(false)} onAdd={addGoal} currency={currency} />}
    </div>
  );
}
