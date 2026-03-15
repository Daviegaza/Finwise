import React from 'react';
import { ArrowUpRight, ArrowDownLeft } from 'lucide-react';
import { CategorySummary, Transaction } from '../../types';
import { CATEGORY_CONFIG, formatCurrency, formatRelativeDate } from '../../utils/categories';

interface CategoryBreakdownProps {
  categories: CategorySummary[];
  currencySymbol: string;
}

export function CategoryBreakdown({ categories, currencySymbol }: CategoryBreakdownProps) {
  const topCats = categories.slice(0, 6);
  return (
    <div className="card p-5">
      <h3 className="font-bold text-base mb-4" style={{ fontFamily: 'Fraunces, serif' }}>
        Spending by Category
      </h3>
      <div className="flex flex-col gap-3">
        {topCats.map((cat) => {
          const config = CATEGORY_CONFIG[cat.category];
          const pct = Math.min(cat.percentage, 100);
          return (
            <div key={cat.category}>
              <div className="flex items-center justify-between mb-1">
                <div className="flex items-center gap-2">
                  <span className="text-base">{config?.icon || '📦'}</span>
                  <span className="text-sm font-medium" style={{ color: 'var(--text-secondary)' }}>
                    {config?.label || cat.category}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-xs" style={{ color: 'var(--text-muted)' }}>
                    {pct.toFixed(0)}%
                  </span>
                  <span className="text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>
                    {formatCurrency(cat.amount, currencySymbol)}
                  </span>
                </div>
              </div>
              <div className="progress-bar" style={{ height: '5px' }}>
                <div className="progress-fill" style={{ width: `${pct}%`, background: config?.color || 'var(--gold)' }} />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

interface RecentTransactionsProps {
  transactions: Transaction[];
  loading: boolean;
  currencySymbol: string;
  onViewAll: () => void;
}

export function RecentTransactions({ transactions, loading, currencySymbol, onViewAll }: RecentTransactionsProps) {
  const recent = transactions.slice(0, 8);

  return (
    <div className="card p-5">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-bold text-base" style={{ fontFamily: 'Fraunces, serif' }}>
          Recent Activity
        </h3>
        <button onClick={onViewAll} className="text-xs font-medium hover:underline" style={{ color: 'var(--gold)' }}>
          View all →
        </button>
      </div>

      {loading ? (
        <div className="flex flex-col gap-3">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="flex items-center gap-3">
              <div className="skeleton w-9 h-9 rounded-xl" />
              <div className="flex-1">
                <div className="skeleton h-3.5 w-28 mb-1.5" />
                <div className="skeleton h-3 w-20" />
              </div>
              <div className="skeleton h-4 w-16" />
            </div>
          ))}
        </div>
      ) : (
        <div className="flex flex-col gap-1">
          {recent.map((t) => {
            const config = CATEGORY_CONFIG[t.category];
            return (
              <div key={t.id} className="flex items-center gap-3 p-2 rounded-xl transition-colors duration-150 cursor-default"
                style={{ hover: 'background: rgba(255,255,255,0.02)' }}>
                <div className="w-9 h-9 rounded-xl flex items-center justify-center text-base flex-shrink-0"
                  style={{ background: config?.bgColor || 'rgba(148,163,184,0.12)' }}>
                  {config?.icon || '📦'}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate" style={{ color: 'var(--text-primary)' }}>
                    {t.description}
                  </p>
                  <p className="text-xs" style={{ color: 'var(--text-muted)' }}>
                    {config?.label} · {formatRelativeDate(t.date)}
                  </p>
                </div>
                <div className="flex items-center gap-1 flex-shrink-0">
                  {t.type === 'income'
                    ? <ArrowDownLeft size={12} style={{ color: 'var(--success)' }} />
                    : <ArrowUpRight size={12} style={{ color: 'var(--danger)' }} />}
                  <span className="text-sm font-semibold"
                    style={{ color: t.type === 'income' ? 'var(--success)' : 'var(--danger)' }}>
                    {t.type === 'income' ? '+' : '-'}{formatCurrency(t.amount, currencySymbol)}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
