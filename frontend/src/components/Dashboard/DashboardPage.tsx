import React, { useState } from 'react';
import { useSummary, useTransactions, useInsights } from '../../hooks';
import StatCards from '../Dashboard/StatCards';
import SpendingChart from '../Dashboard/SpendingChart';
import { CategoryBreakdown, RecentTransactions } from '../Dashboard/Widgets';
import {
  Sparkles, AlertTriangle, TrendingUp, Target, ScanLine,
  Receipt, TrendingDown, Calendar, Smartphone, BarChart3,
  ShieldCheck, Repeat, Building2
} from 'lucide-react';
import { ActivePage } from '../../types';

interface DashboardProps {
  currencySymbol: string;
  onNavigate: (page: ActivePage) => void;
}

const QUICK_ACTIONS = [
  { icon: ScanLine,    label: 'Scan Receipt',   page: 'receipt' as ActivePage,   color: '#C9A84C',  desc: 'Photo → auto-fill' },
  { icon: Smartphone,  label: 'M-Pesa Import',  page: 'mpesa' as ActivePage,     color: '#34D399',  desc: 'Paste SMS messages' },
  { icon: TrendingDown,label: 'Debt Planner',   page: 'debt' as ActivePage,      color: '#F87171',  desc: 'Avalanche & snowball' },
  { icon: TrendingUp,  label: 'Forecast',       page: 'forecast' as ActivePage,  color: '#60A5FA',  desc: 'End-of-month predict' },
  { icon: Sparkles,    label: 'AI Budget',      page: 'budget-ai' as ActivePage, color: '#A78BFA',  desc: 'Claude builds yours' },
  { icon: Calendar,    label: 'Calendar',       page: 'calendar' as ActivePage,  color: '#FBBF24',  desc: 'Bills & events' },
  { icon: BarChart3,   label: 'NSE Stocks',     page: 'stocks' as ActivePage,    color: '#34D399',  desc: 'Track portfolio' },
  { icon: Building2,   label: 'SACCO Calc',     page: 'sacco' as ActivePage,     color: '#06B6D4',  desc: 'Loan eligibility' },
  { icon: ShieldCheck, label: 'Emergency Fund', page: 'emergency' as ActivePage, color: '#F472B6',  desc: 'Safety net tracker' },
  { icon: Repeat,      label: 'Recurring',      page: 'recurring' as ActivePage, color: '#94A3B8',  desc: 'Auto-detect subs' },
  { icon: Target,      label: 'Goals',          page: 'goals' as ActivePage,     color: '#34D399',  desc: 'Track progress' },
  { icon: Receipt,     label: 'Bills',          page: 'bills' as ActivePage,     color: '#FBBF24',  desc: 'Due dates & status' },
];

export default function Dashboard({ currencySymbol, onNavigate }: DashboardProps) {
  const [period, setPeriod] = useState<'month' | 'quarter' | 'year'>('month');
  const { summary, loading: summaryLoading } = useSummary(period);
  const { transactions, loading: txLoading } = useTransactions();
  const { insights, narrative, loading: insightLoading } = useInsights();
  const highPriorityInsights = insights.filter(i => i.priority === 'high').slice(0, 2);

  return (
    <div className="flex flex-col gap-5">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="section-title">Dashboard</h2>
          <p className="section-subtitle">Your complete financial picture</p>
        </div>
        <div className="flex gap-1 p-1 rounded-xl" style={{ background: 'rgba(255,255,255,0.04)' }}>
          {(['month', 'quarter', 'year'] as const).map(p => (
            <button key={p} onClick={() => setPeriod(p)}
              className="px-3 py-1.5 rounded-lg text-xs font-medium capitalize transition-all duration-200"
              style={{ background: period === p ? 'rgba(201,168,76,0.15)' : 'transparent', color: period === p ? 'var(--gold)' : 'var(--text-muted)' }}>
              {p}
            </button>
          ))}
        </div>
      </div>

      {/* Stat cards */}
      <StatCards summary={summary} loading={summaryLoading} currencySymbol={currencySymbol} />

      {/* AI Narrative */}
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
            <p className="text-xs leading-relaxed line-clamp-2" style={{ color: 'var(--text-secondary)' }}>{narrative}</p>
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

      {/* Charts */}
      <div className="grid lg:grid-cols-3 gap-4">
        <div className="lg:col-span-2">
          <SpendingChart summary={summary} loading={summaryLoading} currencySymbol={currencySymbol} />
        </div>
        <div>
          {summary && !summaryLoading
            ? <CategoryBreakdown categories={summary.topCategories} currencySymbol={currencySymbol} />
            : <div className="card p-5 skeleton h-64" />}
        </div>
      </div>

      {/* Quick Actions — all features */}
      <div>
        <h3 className="text-sm font-semibold mb-3 px-0.5" style={{ color: 'var(--text-secondary)' }}>Quick Access</h3>
        <div className="grid grid-cols-3 sm:grid-cols-4 lg:grid-cols-6 gap-3">
          {QUICK_ACTIONS.map(({ icon: Icon, label, page, color, desc }) => (
            <button key={page} onClick={() => onNavigate(page)}
              className="card p-3 flex flex-col items-center gap-2 text-center transition-all duration-200 hover:scale-105"
              style={{ cursor: 'pointer' }}
              onMouseEnter={e => { (e.currentTarget as HTMLElement).style.borderColor = `${color}40`; }}
              onMouseLeave={e => { (e.currentTarget as HTMLElement).style.borderColor = 'var(--border)'; }}>
              <div className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0"
                style={{ background: `${color}18` }}>
                <Icon size={17} style={{ color }} />
              </div>
              <div>
                <p className="text-xs font-semibold leading-tight" style={{ color: 'var(--text-primary)' }}>{label}</p>
                <p className="text-xs mt-0.5 hidden sm:block leading-tight" style={{ color: 'var(--text-muted)', fontSize: '10px' }}>{desc}</p>
              </div>
            </button>
          ))}
        </div>
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
