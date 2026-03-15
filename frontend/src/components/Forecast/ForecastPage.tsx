import React, { useState, useEffect } from 'react';
import { TrendingUp, TrendingDown, AlertTriangle, CheckCircle } from 'lucide-react';
import { getCurrencySymbol } from '../../utils/currency';
import { CATEGORY_CONFIG } from '../../utils/categories';

const BACKEND_URL = import.meta.env.VITE_API_URL || '';
const sym = () => getCurrencySymbol();
const fmt = (n: number) => `${sym()} ${Math.abs(n).toLocaleString('en-KE', { maximumFractionDigits: 0 })}`;

interface CategoryForecast {
  category: string;
  spent: number;
  projected: number;
  budget: number;
  daysInMonth: number;
  daysPassed: number;
  status: 'on-track' | 'warning' | 'over';
}

export default function ForecastPage() {
  const [forecasts, setForecasts] = useState<CategoryForecast[]>([]);
  const [summary, setSummary] = useState({ totalSpent: 0, totalProjected: 0, totalBudget: 0, daysLeft: 0 });
  const [loading, setLoading] = useState(true);
  const [fetchError, setFetchError] = useState('');

  useEffect(() => {
    const load = async () => {
      try {
        const [txRes, budgetRes] = await Promise.all([
          fetch(`${BACKEND_URL}/api/transactions/demo-user?limit=200`),
          fetch(`${BACKEND_URL}/api/budgets/demo-user`),
        ]);
        const { transactions } = await txRes.json();
        const { budgets } = await budgetRes.json();

        const now = new Date();
        const daysInMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate();
        const daysPassed = now.getDate();
        const daysLeft = daysInMonth - daysPassed;

        const thisMonth = transactions.filter((t: any) => {
          const d = new Date(t.date);
          return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear() && t.type === 'expense';
        });

        const byCategory: Record<string, number> = {};
        thisMonth.forEach((t: any) => {
          byCategory[t.category] = (byCategory[t.category] || 0) + t.amount;
        });

        const fc: CategoryForecast[] = budgets.map((b: any) => {
          const spent = byCategory[b.category] || 0;
          const dailyRate = daysPassed > 0 ? spent / daysPassed : 0;
          const projected = dailyRate * daysInMonth;
          let status: 'on-track' | 'warning' | 'over' = 'on-track';
          if (projected > b.limit) status = 'over';
          else if (projected > b.limit * 0.8) status = 'warning';
          return { category: b.category, spent, projected, budget: b.limit, daysInMonth, daysPassed, status };
        });

        const totalSpent = fc.reduce((s, f) => s + f.spent, 0);
        const totalProjected = fc.reduce((s, f) => s + f.projected, 0);
        const totalBudget = fc.reduce((s, f) => s + f.budget, 0);

        setForecasts(fc.sort((a, b) => (b.projected / b.budget) - (a.projected / a.budget)));
        setSummary({ totalSpent, totalProjected, totalBudget, daysLeft });
      } catch (e: any) {
        console.error(e);
        setFetchError(e.message || 'Could not connect to backend. Make sure it is running.');
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  if (loading) return (
    <div className="flex flex-col gap-4">
      <h2 className="section-title">Spending Forecast</h2>
      {[1,2,3].map(i => <div key={i} className="card p-5 skeleton h-20" />)}
    </div>
  );

  const overCount = forecasts.filter(f => f.status === 'over').length;
  const warnCount = forecasts.filter(f => f.status === 'warning').length;

  return (
    <div className="flex flex-col gap-4">
      <div>
        <h2 className="section-title">Spending Forecast</h2>
        <p className="section-subtitle">Predicted end-of-month spend based on your current pace</p>
      </div>

      {/* Summary */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          { label: 'Spent So Far', val: fmt(summary.totalSpent), color: 'var(--text-primary)' },
          { label: 'Projected Total', val: fmt(summary.totalProjected), color: summary.totalProjected > summary.totalBudget ? 'var(--danger)' : 'var(--success)' },
          { label: 'Days Left', val: summary.daysLeft, color: 'var(--info)' },
          { label: 'Categories at Risk', val: overCount + warnCount, color: overCount > 0 ? 'var(--danger)' : warnCount > 0 ? 'var(--warning)' : 'var(--success)' },
        ].map(s => (
          <div key={s.label} className="card p-4">
            <p className="text-xs mb-1" style={{ color: 'var(--text-muted)' }}>{s.label}</p>
            <p className="text-xl font-bold" style={{ color: s.color, fontFamily: 'Fraunces, serif' }}>{s.val}</p>
          </div>
        ))}
      </div>

      {/* Alert banner */}
      {overCount > 0 && (
        <div className="card p-4 flex items-center gap-3" style={{ background: 'rgba(248,113,113,0.06)', borderColor: 'rgba(248,113,113,0.3)' }}>
          <AlertTriangle size={18} style={{ color: 'var(--danger)', flexShrink: 0 }} />
          <p className="text-sm" style={{ color: 'var(--danger)' }}>
            <strong>{overCount} {overCount === 1 ? 'category' : 'categories'}</strong> projected to exceed budget by end of month. Act now to stay on track.
          </p>
        </div>
      )}

      {/* Category forecasts */}
      <div className="flex flex-col gap-3">
        {forecasts.map(f => {
          const meta = CATEGORY_CONFIG[f.category as keyof typeof CATEGORY_CONFIG];
          const pct = f.budget > 0 ? (f.projected / f.budget) * 100 : 0;
          const spentPct = f.budget > 0 ? (f.spent / f.budget) * 100 : 0;
          const statusColor = f.status === 'over' ? 'var(--danger)' : f.status === 'warning' ? 'var(--warning)' : 'var(--success)';
          const Icon = f.status === 'over' ? TrendingUp : f.status === 'warning' ? AlertTriangle : CheckCircle;

          return (
            <div key={f.category} className="card p-4">
              <div className="flex items-center justify-between mb-3 flex-wrap gap-2">
                <div className="flex items-center gap-2">
                  <span className="text-lg">{meta?.icon || '📦'}</span>
                  <div>
                    <p className="font-medium text-sm" style={{ color: 'var(--text-primary)' }}>{meta?.label || f.category}</p>
                    <p className="text-xs" style={{ color: 'var(--text-muted)' }}>
                      Spent {fmt(f.spent)} of {fmt(f.budget)} budget
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Icon size={14} style={{ color: statusColor }} />
                  <span className="text-sm font-semibold" style={{ color: statusColor }}>
                    {f.status === 'over' ? `${fmt(f.projected - f.budget)} over` :
                     f.status === 'warning' ? 'Near limit' : 'On track'}
                  </span>
                </div>
              </div>

              {/* Dual progress bar: spent (solid) + projected (ghost) */}
              <div className="relative h-3 rounded-full overflow-hidden" style={{ background: 'rgba(255,255,255,0.06)' }}>
                {/* Projected */}
                <div className="absolute inset-y-0 left-0 rounded-full transition-all duration-700"
                  style={{ width: `${Math.min(pct, 100)}%`, background: `${statusColor}30` }} />
                {/* Actual spent */}
                <div className="absolute inset-y-0 left-0 rounded-full transition-all duration-700"
                  style={{ width: `${Math.min(spentPct, 100)}%`, background: statusColor }} />
              </div>

              <div className="flex justify-between mt-2 text-xs" style={{ color: 'var(--text-muted)' }}>
                <span>Projected: <strong style={{ color: statusColor }}>{fmt(f.projected)}</strong></span>
                <span>Budget: {fmt(f.budget)}</span>
              </div>
            </div>
          );
        })}

        {forecasts.length === 0 && (
          <div className="card p-16 text-center">
            <TrendingUp size={40} className="mx-auto mb-3 opacity-20" style={{ color: 'var(--gold)' }} />
            <p className="text-sm" style={{ color: 'var(--text-muted)' }}>Set up budgets first to see forecasts</p>
          </div>
        )}
      </div>
    </div>
  );
}
