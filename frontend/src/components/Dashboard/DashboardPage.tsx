import React, { useState } from 'react';
import { useSummary, useTransactions, useInsights } from '../../hooks';
import StatCards from '../Dashboard/StatCards';
import SpendingChart from '../Dashboard/SpendingChart';
import { CategoryBreakdown, RecentTransactions } from '../Dashboard/Widgets';
import { Sparkles, AlertTriangle, TrendingUp, Target } from 'lucide-react';
import { ActivePage } from '../../types';
import { formatCurrency } from '../../utils/categories';

interface DashboardProps {
  currencySymbol: string;
  onNavigate: (page: ActivePage) => void;
}

export default function Dashboard({ currencySymbol, onNavigate }: DashboardProps) {
  const [period, setPeriod] = useState<'month' | 'quarter' | 'year'>('month');
  const { summary, loading: summaryLoading } = useSummary(period);
  const { transactions, loading: txLoading } = useTransactions();
  const { insights, narrative, loading: insightLoading } = useInsights();

  const highPriorityInsights = insights.filter(i => i.priority === 'high').slice(0, 2);

  return (
    <div className="flex flex-col gap-5">
      {/* Period selector */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="section-title">Dashboard</h2>
          <p className="section-subtitle">Your complete financial picture</p>
        </div>
        <div className="flex gap-1 p-1 rounded-xl" style={{ background: 'rgba(255,255,255,0.04)' }}>
          {(['month', 'quarter', 'year'] as const).map(p => (
            <button key={p} onClick={() => setPeriod(p)}
              className="px-3 py-1.5 rounded-lg text-xs font-medium capitalize transition-all duration-200"
              style={{
                background: period === p ? 'rgba(201,168,76,0.15)' : 'transparent',
                color: period === p ? 'var(--gold)' : 'var(--text-muted)',
              }}>
              {p}
            </button>
          ))}
        </div>
      </div>

      {/* Stat cards */}
      <StatCards summary={summary} loading={summaryLoading} currencySymbol={currencySymbol} />

      {/* AI Narrative strip */}
      {!insightLoading && narrative && (
        <div className="card p-4 flex items-start gap-3 cursor-pointer"
          onClick={() => onNavigate('insights')}
          style={{ borderColor: 'rgba(201,168,76,0.25)', background: 'rgba(201,168,76,0.05)' }}>
          <div className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0"
            style={{ background: 'linear-gradient(135deg,#C9A84C,#E8C86D)' }}>
            <Sparkles size={14} style={{ color: '#1A1000' }} />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-xs font-semibold gold-text mb-0.5">AI Financial Summary</p>
            <p className="text-xs leading-relaxed line-clamp-2" style={{ color: 'var(--text-secondary)' }}>
              {narrative}
            </p>
          </div>
          <span className="text-xs flex-shrink-0" style={{ color: 'var(--gold)' }}>View →</span>
        </div>
      )}

      {/* Alert insights */}
      {highPriorityInsights.length > 0 && (
        <div className="flex flex-col gap-2">
          {highPriorityInsights.map(i => (
            <div key={i.id} className="card p-3.5 flex items-start gap-3 cursor-pointer"
              onClick={() => onNavigate('insights')}
              style={{ borderColor: 'rgba(248,113,113,0.2)', background: 'rgba(248,113,113,0.05)' }}>
              <AlertTriangle size={15} style={{ color: 'var(--danger)', flexShrink: 0, marginTop: 1 }} />
              <div className="flex-1 min-w-0">
                <p className="text-xs font-semibold mb-0.5" style={{ color: 'var(--danger)' }}>{i.title}</p>
                <p className="text-xs" style={{ color: 'var(--text-muted)' }}>{i.message}</p>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Charts row */}
      <div className="grid lg:grid-cols-3 gap-4">
        <div className="lg:col-span-2">
          <SpendingChart summary={summary} loading={summaryLoading} currencySymbol={currencySymbol} />
        </div>
        <div>
          {summary && !summaryLoading ? (
            <CategoryBreakdown categories={summary.topCategories} currencySymbol={currencySymbol} />
          ) : (
            <div className="card p-5 skeleton h-64" />
          )}
        </div>
      </div>

      {/* Quick actions */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          { icon: TrendingUp, label: 'View Insights', page: 'insights' as ActivePage, color: 'var(--gold)' },
          { icon: Target, label: 'My Goals', page: 'goals' as ActivePage, color: 'var(--success)' },
          { icon: Sparkles, label: 'Ask AI', page: 'advisor' as ActivePage, color: 'var(--purple)' },
          { icon: TrendingUp, label: 'Transactions', page: 'transactions' as ActivePage, color: 'var(--info)' },
        ].map(({ icon: Icon, label, page, color }) => (
          <button key={page} onClick={() => onNavigate(page)}
            className="card p-4 flex flex-col items-center gap-2 text-center transition-all duration-200"
            style={{ cursor: 'pointer' }}
            onMouseEnter={e => {
              (e.currentTarget as HTMLElement).style.borderColor = `${color}40`;
              (e.currentTarget as HTMLElement).style.background = `${color}08`;
            }}
            onMouseLeave={e => {
              (e.currentTarget as HTMLElement).style.borderColor = 'var(--border)';
              (e.currentTarget as HTMLElement).style.background = 'var(--bg-card)';
            }}>
            <div className="w-9 h-9 rounded-xl flex items-center justify-center" style={{ background: `${color}15` }}>
              <Icon size={18} style={{ color }} />
            </div>
            <span className="text-xs font-medium" style={{ color: 'var(--text-secondary)' }}>{label}</span>
          </button>
        ))}
      </div>

      {/* Recent transactions */}
      <RecentTransactions
        transactions={transactions}
        loading={txLoading}
        currencySymbol={currencySymbol}
        onViewAll={() => onNavigate('transactions')}
      />
    </div>
  );
}
