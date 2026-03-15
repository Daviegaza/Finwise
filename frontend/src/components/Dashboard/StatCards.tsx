import React from 'react';
import { TrendingUp, TrendingDown, DollarSign, PiggyBank, ArrowUpRight, ArrowDownRight } from 'lucide-react';
import { FinancialSummary } from '../../types';
import { formatCurrency } from '../../utils/categories';

interface StatCardsProps {
  summary: FinancialSummary | null;
  loading: boolean;
  currencySymbol: string;
}

interface StatCard {
  title: string;
  value: string;
  subtext: string;
  icon: React.ComponentType<{ size?: number }>;
  trend?: 'up' | 'down' | 'neutral';
  trendValue?: string;
  color: string;
  bgGlow: string;
}

function SkeletonCard() {
  return (
    <div className="card p-5">
      <div className="skeleton h-4 w-24 mb-3" />
      <div className="skeleton h-8 w-32 mb-2" />
      <div className="skeleton h-3 w-20" />
    </div>
  );
}

export default function StatCards({ summary, loading, currencySymbol }: StatCardsProps) {
  if (loading) {
    return (
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 lg:gap-4">
        {[...Array(4)].map((_, i) => <SkeletonCard key={i} />)}
      </div>
    );
  }

  if (!summary) return null;

  const cards: StatCard[] = [
    {
      title: 'Total Income',
      value: formatCurrency(summary.totalIncome, currencySymbol),
      subtext: 'This period',
      icon: TrendingUp,
      trend: 'up',
      trendValue: '+8.2%',
      color: 'var(--success)',
      bgGlow: 'rgba(52,211,153,0.08)',
    },
    {
      title: 'Total Expenses',
      value: formatCurrency(summary.totalExpenses, currencySymbol),
      subtext: 'This period',
      icon: TrendingDown,
      trend: summary.totalExpenses > summary.totalIncome * 0.8 ? 'down' : 'neutral',
      trendValue: '+3.1%',
      color: 'var(--danger)',
      bgGlow: 'rgba(248,113,113,0.08)',
    },
    {
      title: 'Net Savings',
      value: formatCurrency(summary.netSavings, currencySymbol),
      subtext: `${summary.savingsRate.toFixed(1)}% savings rate`,
      icon: PiggyBank,
      trend: summary.netSavings > 0 ? 'up' : 'down',
      trendValue: summary.netSavings > 0 ? 'Positive' : 'Negative',
      color: 'var(--gold)',
      bgGlow: 'rgba(201,168,76,0.08)',
    },
    {
      title: 'Avg. Daily Spend',
      value: formatCurrency(summary.totalExpenses / 30, currencySymbol),
      subtext: 'Per day this month',
      icon: DollarSign,
      trend: 'neutral',
      color: 'var(--info)',
      bgGlow: 'rgba(96,165,250,0.08)',
    },
  ];

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 lg:gap-4">
      {cards.map((card, i) => {
        const Icon = card.icon;
        return (
          <div
            key={i}
            className="card p-4 lg:p-5 animate-fade-slide-up cursor-default"
            style={{ animationDelay: `${i * 0.08}s`, background: `var(--bg-card)` }}
          >
            {/* Header */}
            <div className="flex items-start justify-between mb-3">
              <div className="w-9 h-9 rounded-xl flex items-center justify-center"
                style={{ background: card.bgGlow }}>
                <Icon size={18} style={{ color: card.color }} />
              </div>
              {card.trend && card.trendValue && (
                <div className="flex items-center gap-1 text-xs font-medium"
                  style={{ color: card.trend === 'up' ? 'var(--success)' : card.trend === 'down' ? 'var(--danger)' : 'var(--text-muted)' }}>
                  {card.trend === 'up' ? <ArrowUpRight size={12} /> : card.trend === 'down' ? <ArrowDownRight size={12} /> : null}
                  {card.trendValue}
                </div>
              )}
            </div>

            {/* Value */}
            <div className="mb-1">
              <p className="font-bold text-xl lg:text-2xl leading-tight" style={{ color: card.color, fontFamily: 'Fraunces, serif' }}>
                {card.value}
              </p>
            </div>

            {/* Label */}
            <p className="text-xs font-medium mb-0.5" style={{ color: 'var(--text-secondary)' }}>
              {card.title}
            </p>
            <p className="text-xs" style={{ color: 'var(--text-muted)' }}>
              {card.subtext}
            </p>
          </div>
        );
      })}
    </div>
  );
}
