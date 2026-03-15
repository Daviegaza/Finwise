import React, { useState } from 'react';
import { Plus, Trash2, AlertTriangle, CheckCircle, X } from 'lucide-react';
import { useBudgets } from '../../hooks';
import { Budget, TransactionCategory } from '../../types';
import { CATEGORY_CONFIG, EXPENSE_CATEGORIES, formatCurrency, getProgressColor } from '../../utils/categories';

function ProgressRing({ percentage, color, size = 80 }: { percentage: number; color: string; size?: number }) {
  const r = (size - 8) / 2;
  const circ = 2 * Math.PI * r;
  const pct = Math.min(percentage, 100);
  const dash = (pct / 100) * circ;
  const gap = circ - dash;

  return (
    <svg width={size} height={size} className="rotate-[-90deg]">
      <circle cx={size / 2} cy={size / 2} r={r} fill="none"
        stroke="rgba(255,255,255,0.06)" strokeWidth={6} />
      <circle cx={size / 2} cy={size / 2} r={r} fill="none"
        stroke={color} strokeWidth={6} strokeLinecap="round"
        strokeDasharray={`${dash} ${gap}`}
        style={{ transition: 'stroke-dasharray 0.6s ease-out' }} />
    </svg>
  );
}

function BudgetCard({ budget, currencySymbol, onDelete }: { budget: Budget; currencySymbol: string; onDelete: (id: string) => void }) {
  const pct = budget.limit > 0 ? (budget.spent / budget.limit) * 100 : 0;
  const color = getProgressColor(pct);
  const cfg = CATEGORY_CONFIG[budget.category];
  const remaining = budget.limit - budget.spent;
  const isOver = pct > 100;

  return (
    <div className="card p-5 group">
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl flex items-center justify-center text-lg"
            style={{ background: cfg?.bgColor || 'rgba(148,163,184,0.12)' }}>
            {cfg?.icon || '📦'}
          </div>
          <div>
            <p className="font-semibold text-sm" style={{ color: 'var(--text-primary)' }}>{cfg?.label}</p>
            <p className="text-xs capitalize" style={{ color: 'var(--text-muted)' }}>{budget.period}</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {isOver
            ? <span className="badge badge-danger text-xs"><AlertTriangle size={10} /> Over</span>
            : pct < 50 ? <span className="badge badge-success text-xs"><CheckCircle size={10} /> On Track</span>
            : <span className="badge badge-warning text-xs">⚠ Watch Out</span>}
          <button onClick={() => onDelete(budget.id)}
            className="opacity-0 group-hover:opacity-100 p-1.5 rounded-lg transition-all"
            style={{ color: 'var(--danger)' }}>
            <Trash2 size={14} />
          </button>
        </div>
      </div>

      {/* Ring + stats */}
      <div className="flex items-center gap-4">
        <div className="relative flex-shrink-0">
          <ProgressRing percentage={pct} color={color} size={72} />
          <div className="absolute inset-0 flex items-center justify-center">
            <span className="text-xs font-bold" style={{ color }}>{pct.toFixed(0)}%</span>
          </div>
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex justify-between text-xs mb-1" style={{ color: 'var(--text-muted)' }}>
            <span>Spent</span>
            <span>Limit</span>
          </div>
          <div className="flex justify-between font-semibold text-sm mb-2">
            <span style={{ color: isOver ? 'var(--danger)' : 'var(--text-primary)' }}>
              {formatCurrency(budget.spent, currencySymbol)}
            </span>
            <span style={{ color: 'var(--text-secondary)' }}>{formatCurrency(budget.limit, currencySymbol)}</span>
          </div>
          <div className="progress-bar" style={{ height: '4px' }}>
            <div className="progress-fill" style={{ width: `${Math.min(pct, 100)}%`, background: color }} />
          </div>
          <p className="text-xs mt-1.5" style={{ color: isOver ? 'var(--danger)' : 'var(--text-muted)' }}>
            {isOver ? `${formatCurrency(Math.abs(remaining), currencySymbol)} over budget` : `${formatCurrency(remaining, currencySymbol)} remaining`}
          </p>
        </div>
      </div>
    </div>
  );
}

function AddBudgetModal({ onClose, onAdd, currency }: {
  onClose: () => void;
  onAdd: (b: Omit<Budget, 'id' | 'userId' | 'spent'>) => Promise<Budget>;
  currency: string;
}) {
  const [form, setForm] = useState({ category: 'food' as TransactionCategory, limit: '', period: 'monthly' as const, color: '#C9A84C' });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await onAdd({ ...form, limit: parseFloat(form.limit), currency });
      onClose();
    } finally { setLoading(false); }
  };

  const COLORS = ['#C9A84C', '#60A5FA', '#F87171', '#34D399', '#A78BFA', '#F472B6', '#FBBF24', '#06B6D4'];

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4"
      style={{ background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(8px)' }}>
      <div className="w-full max-w-md card p-6 animate-fade-slide-up">
        <div className="flex items-center justify-between mb-6">
          <h3 className="font-bold text-lg" style={{ fontFamily: 'Fraunces, serif' }}>New Budget</h3>
          <button onClick={onClose} className="btn-ghost p-1.5 rounded-lg"><X size={18} /></button>
        </div>
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div>
            <label className="label">Category</label>
            <select className="input-field" value={form.category}
              onChange={e => setForm(f => ({ ...f, category: e.target.value as TransactionCategory }))}>
              {EXPENSE_CATEGORIES.map(c => (
                <option key={c} value={c} style={{ background: 'var(--bg-card)' }}>
                  {CATEGORY_CONFIG[c]?.icon} {CATEGORY_CONFIG[c]?.label}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="label">Monthly Limit</label>
            <input className="input-field" type="number" step="0.01" min="0" placeholder="0.00"
              value={form.limit} onChange={e => setForm(f => ({ ...f, limit: e.target.value }))} required />
          </div>
          <div>
            <label className="label">Color</label>
            <div className="flex gap-2 flex-wrap">
              {COLORS.map(c => (
                <button key={c} type="button" onClick={() => setForm(f => ({ ...f, color: c }))}
                  className="w-7 h-7 rounded-full transition-transform duration-150"
                  style={{ background: c, transform: form.color === c ? 'scale(1.25)' : 'scale(1)',
                    boxShadow: form.color === c ? `0 0 0 2px var(--bg-card), 0 0 0 4px ${c}` : 'none' }} />
              ))}
            </div>
          </div>
          <div className="flex gap-3 pt-2">
            <button type="button" onClick={onClose} className="btn-ghost flex-1 py-3">Cancel</button>
            <button type="submit" disabled={loading} className="btn-gold flex-1 py-3">
              {loading ? 'Adding...' : 'Add Budget'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default function BudgetPage({ currencySymbol, currency }: { currencySymbol: string; currency: string }) {
  const { budgets, loading, addBudget, deleteBudget } = useBudgets();
  const [showModal, setShowModal] = useState(false);

  const totalBudgeted = budgets.reduce((s, b) => s + b.limit, 0);
  const totalSpent = budgets.reduce((s, b) => s + b.spent, 0);
  const overBudget = budgets.filter(b => b.spent > b.limit).length;

  return (
    <div className="flex flex-col gap-5">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h2 className="section-title">Budgets</h2>
          <p className="section-subtitle">Track spending limits by category</p>
        </div>
        <button onClick={() => setShowModal(true)} className="btn-gold flex items-center gap-2 flex-shrink-0">
          <Plus size={16} /> <span className="hidden sm:inline">New Budget</span>
        </button>
      </div>

      {/* Summary row */}
      <div className="grid grid-cols-3 gap-3">
        {[
          { label: 'Total Budgeted', value: formatCurrency(totalBudgeted, currencySymbol), color: 'var(--gold)' },
          { label: 'Total Spent', value: formatCurrency(totalSpent, currencySymbol), color: totalSpent > totalBudgeted ? 'var(--danger)' : 'var(--success)' },
          { label: 'Over Budget', value: `${overBudget} ${overBudget === 1 ? 'category' : 'categories'}`, color: overBudget > 0 ? 'var(--danger)' : 'var(--success)' },
        ].map(s => (
          <div key={s.label} className="card p-4 text-center">
            <p className="text-lg font-bold" style={{ color: s.color, fontFamily: 'Fraunces, serif' }}>{s.value}</p>
            <p className="text-xs mt-0.5" style={{ color: 'var(--text-muted)' }}>{s.label}</p>
          </div>
        ))}
      </div>

      {loading ? (
        <div className="grid sm:grid-cols-2 gap-4">
          {[...Array(4)].map((_, i) => <div key={i} className="card p-5 skeleton h-40" />)}
        </div>
      ) : budgets.length === 0 ? (
        <div className="card p-12 text-center">
          <p className="text-4xl mb-4">💰</p>
          <p className="font-semibold text-lg mb-2" style={{ fontFamily: 'Fraunces, serif' }}>No budgets yet</p>
          <p className="text-sm mb-6" style={{ color: 'var(--text-muted)' }}>Create budgets to track your spending by category</p>
          <button onClick={() => setShowModal(true)} className="btn-gold">Create First Budget</button>
        </div>
      ) : (
        <div className="grid sm:grid-cols-2 gap-4">
          {budgets.map(b => (
            <BudgetCard key={b.id} budget={b} currencySymbol={currencySymbol} onDelete={deleteBudget} />
          ))}
        </div>
      )}

      {showModal && <AddBudgetModal onClose={() => setShowModal(false)} onAdd={addBudget} currency={currency} />}
    </div>
  );
}
