import React, { useState } from 'react';
import {
  AreaChart, Area, BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend
} from 'recharts';
import { FinancialSummary } from '../../types';
import { CATEGORY_CONFIG, formatCurrency } from '../../utils/categories';

type ChartType = 'area' | 'bar' | 'donut';

interface SpendingChartProps {
  summary: FinancialSummary | null;
  loading: boolean;
  currencySymbol: string;
}

const CustomTooltip = ({ active, payload, label, sym }: { active?: boolean; payload?: { value: number; name: string; color: string }[]; label?: string; sym: string }) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="card p-3 text-xs" style={{ minWidth: 140 }}>
      <p className="font-semibold mb-2" style={{ color: 'var(--text-secondary)' }}>{label}</p>
      {payload.map((p, i) => (
        <div key={i} className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-1.5">
            <div className="w-2 h-2 rounded-full" style={{ background: p.color }} />
            <span style={{ color: 'var(--text-muted)' }}>{p.name}</span>
          </div>
          <span className="font-medium" style={{ color: 'var(--text-primary)' }}>
            {formatCurrency(p.value, sym)}
          </span>
        </div>
      ))}
    </div>
  );
};

export default function SpendingChart({ summary, loading, currencySymbol }: SpendingChartProps) {
  const [chartType, setChartType] = useState<ChartType>('area');

  if (loading || !summary) {
    return (
      <div className="card p-5">
        <div className="skeleton h-5 w-40 mb-4" />
        <div className="skeleton h-48 w-full" />
      </div>
    );
  }

  const donutData = summary.topCategories.slice(0, 6).map(c => ({
    name: CATEGORY_CONFIG[c.category]?.label || c.category,
    value: Math.round(c.amount),
    color: CATEGORY_CONFIG[c.category]?.color || '#94A3B8',
    percentage: c.percentage,
  }));

  return (
    <div className="card p-5">
      {/* Header */}
      <div className="flex items-center justify-between mb-5 flex-wrap gap-2">
        <div>
          <h3 className="font-bold text-base" style={{ fontFamily: 'Fraunces, serif' }}>
            Financial Overview
          </h3>
          <p className="text-xs" style={{ color: 'var(--text-muted)' }}>Last 6 months</p>
        </div>
        <div className="flex gap-1 p-1 rounded-lg" style={{ background: 'rgba(255,255,255,0.04)' }}>
          {(['area', 'bar', 'donut'] as ChartType[]).map(t => (
            <button
              key={t}
              onClick={() => setChartType(t)}
              className="px-3 py-1.5 rounded-md text-xs font-medium transition-all duration-200 capitalize"
              style={{
                background: chartType === t ? 'rgba(201,168,76,0.15)' : 'transparent',
                color: chartType === t ? 'var(--gold)' : 'var(--text-muted)',
              }}
            >
              {t}
            </button>
          ))}
        </div>
      </div>

      {/* Charts */}
      <div style={{ height: 220 }}>
        <ResponsiveContainer width="100%" height="100%">
          {chartType === 'area' ? (
            <AreaChart data={summary.monthlyTrend} margin={{ top: 5, right: 5, left: -20, bottom: 0 }}>
              <defs>
                <linearGradient id="incomeGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#34D399" stopOpacity={0.3} />
                  <stop offset="100%" stopColor="#34D399" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="expenseGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#F87171" stopOpacity={0.3} />
                  <stop offset="100%" stopColor="#F87171" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="savingsGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#C9A84C" stopOpacity={0.3} />
                  <stop offset="100%" stopColor="#C9A84C" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" />
              <XAxis dataKey="month" tick={{ fill: 'var(--text-muted)', fontSize: 11 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fill: 'var(--text-muted)', fontSize: 10 }} axisLine={false} tickLine={false}
                tickFormatter={v => `${currencySymbol}${(v / 1000).toFixed(0)}k`} />
              <Tooltip content={<CustomTooltip sym={currencySymbol} />} />
              <Area type="monotone" dataKey="income" stroke="#34D399" strokeWidth={2} fill="url(#incomeGrad)" name="Income" />
              <Area type="monotone" dataKey="expenses" stroke="#F87171" strokeWidth={2} fill="url(#expenseGrad)" name="Expenses" />
              <Area type="monotone" dataKey="savings" stroke="#C9A84C" strokeWidth={2} fill="url(#savingsGrad)" name="Savings" />
            </AreaChart>
          ) : chartType === 'bar' ? (
            <BarChart data={summary.monthlyTrend} margin={{ top: 5, right: 5, left: -20, bottom: 0 }} barSize={14} barGap={3}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" />
              <XAxis dataKey="month" tick={{ fill: 'var(--text-muted)', fontSize: 11 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fill: 'var(--text-muted)', fontSize: 10 }} axisLine={false} tickLine={false}
                tickFormatter={v => `${currencySymbol}${(v / 1000).toFixed(0)}k`} />
              <Tooltip content={<CustomTooltip sym={currencySymbol} />} />
              <Bar dataKey="income" fill="#34D399" name="Income" radius={[4, 4, 0, 0]} />
              <Bar dataKey="expenses" fill="#F87171" name="Expenses" radius={[4, 4, 0, 0]} />
              <Bar dataKey="savings" fill="#C9A84C" name="Savings" radius={[4, 4, 0, 0]} />
            </BarChart>
          ) : (
            <PieChart>
              <Pie data={donutData} cx="50%" cy="50%" innerRadius={55} outerRadius={90}
                paddingAngle={3} dataKey="value" nameKey="name">
                {donutData.map((entry, i) => (
                  <Cell key={i} fill={entry.color} opacity={0.9} />
                ))}
              </Pie>
              <Tooltip formatter={(val: number) => [formatCurrency(val, currencySymbol), '']} />
              <Legend iconType="circle" iconSize={8}
                formatter={(v) => <span style={{ color: 'var(--text-secondary)', fontSize: 11 }}>{v}</span>} />
            </PieChart>
          )}
        </ResponsiveContainer>
      </div>

      {/* Legend for area/bar */}
      {chartType !== 'donut' && (
        <div className="flex gap-4 mt-4 pt-4 border-t flex-wrap" style={{ borderColor: 'var(--border)' }}>
          {[{ color: '#34D399', label: 'Income' }, { color: '#F87171', label: 'Expenses' }, { color: '#C9A84C', label: 'Savings' }].map(l => (
            <div key={l.label} className="flex items-center gap-1.5">
              <div className="w-2.5 h-2.5 rounded-full" style={{ background: l.color }} />
              <span className="text-xs" style={{ color: 'var(--text-muted)' }}>{l.label}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
