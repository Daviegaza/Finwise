import { getCurrencySymbol } from '../../utils/currency';
import React, { useState } from 'react';
import { Plus, Trash2, TrendingUp, BarChart3 } from 'lucide-react';
import { useLocalInvestments } from '../../hooks/useInvestments';
import { INVESTMENT_META, RISK_COLORS } from '../../utils/investments';
import type { InvestmentCategory, InvestmentStatus } from '../../types';
import toast from 'react-hot-toast';


export default function InvestmentsPage() {
  const sym = getCurrencySymbol();
  const fmt = (n: number) => `${sym} ${Math.abs(n).toLocaleString('en-KE', { maximumFractionDigits: 0 })}`;
  const { investments, monthlyInvestments, selectedMonth, setSelectedMonth, summary, addInvestment, removeInvestment, updateStatus } = useLocalInvestments();
  const [showAdd, setShowAdd] = useState(false);
  const [form, setForm] = useState({ name: '', amount: '', category: 'mmf' as InvestmentCategory, expectedReturnPct: '', date: new Date().toISOString().slice(0,7), notes: '', isRecurring: false });

  const handleAdd = () => {
    if (!form.name || !form.amount) return toast.error('Name and amount required');
    addInvestment({ name: form.name, amount: parseFloat(form.amount), category: form.category, expectedReturnPct: parseFloat(form.expectedReturnPct) || INVESTMENT_META[form.category].avgReturn, date: form.date + '-01', notes: form.notes, status: 'active', isRecurring: form.isRecurring });
    setForm({ name: '', amount: '', category: 'mmf', expectedReturnPct: '', date: new Date().toISOString().slice(0,7), notes: '', isRecurring: false });
    setShowAdd(false);
    toast.success('Investment added!');
  };

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-start justify-between flex-wrap gap-3">
        <div>
          <h2 className="section-title">Investments</h2>
          <p className="section-subtitle">Track your wealth-building portfolio</p>
        </div>
        <button onClick={() => setShowAdd(true)} className="btn-gold flex items-center gap-2 text-sm">
          <Plus size={16} /> Add Investment
        </button>
      </div>

      {/* Summary */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          { label: 'Total Invested', val: fmt(summary.totalInvested), color: 'var(--gold)' },
          { label: 'Active Positions', val: summary.activeCount, color: 'var(--info)' },
          { label: 'This Month', val: fmt(summary.totalMonthly), color: 'var(--success)' },
          { label: 'Projected Annual', val: fmt(summary.projectedAnnualReturn), color: 'var(--purple)' },
        ].map(s => (
          <div key={s.label} className="card p-4">
            <p className="text-xs mb-1" style={{ color: 'var(--text-muted)' }}>{s.label}</p>
            <p className="text-xl font-bold" style={{ color: s.color, fontFamily: 'Fraunces, serif' }}>{s.val}</p>
          </div>
        ))}
      </div>

      {/* Month filter */}
      <div className="flex items-center gap-3">
        <label className="text-sm font-medium" style={{ color: 'var(--text-secondary)' }}>Month:</label>
        <input type="month" className="input-field" style={{ width: 'auto' }} value={selectedMonth} onChange={e => setSelectedMonth(e.target.value)} />
      </div>

      {/* Portfolio breakdown */}
      {summary.totalInvested > 0 && (
        <div className="card p-5">
          <h3 className="font-semibold text-sm mb-4" style={{ color: 'var(--text-secondary)' }}>Portfolio Breakdown</h3>
          <div className="flex flex-col gap-2">
            {Object.entries(summary.byCategory).sort((a,b) => b[1]-a[1]).map(([cat, amt]) => {
              const meta = INVESTMENT_META[cat as InvestmentCategory];
              const pct = summary.totalInvested > 0 ? (amt / summary.totalInvested) * 100 : 0;
              return (
                <div key={cat}>
                  <div className="flex justify-between text-xs mb-1">
                    <span style={{ color: 'var(--text-secondary)' }}>{meta.icon} {meta.label}</span>
                    <span style={{ color: 'var(--text-primary)' }}>{fmt(amt)} <span style={{ color: 'var(--text-muted)' }}>({pct.toFixed(0)}%)</span></span>
                  </div>
                  <div className="h-1.5 rounded-full" style={{ background: 'rgba(255,255,255,0.07)' }}>
                    <div className="h-full rounded-full transition-all duration-700" style={{ width: `${pct}%`, background: meta.color }} />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Investments list */}
      <div className="card overflow-hidden">
        {investments.length === 0 ? (
          <div className="p-16 text-center">
            <TrendingUp size={40} className="mx-auto mb-3 opacity-30" style={{ color: 'var(--gold)' }} />
            <p className="font-medium mb-1" style={{ color: 'var(--text-secondary)' }}>No investments yet</p>
            <p className="text-sm" style={{ color: 'var(--text-muted)' }}>Add SACCOs, MMFs, stocks, bonds and more</p>
          </div>
        ) : (
          <div className="divide-y" style={{ borderColor: 'var(--border)' }}>
            {investments.map(inv => {
              const meta = INVESTMENT_META[inv.category];
              const risk = RISK_COLORS[meta.riskLevel];
              return (
                <div key={inv.id} className="flex items-center gap-3 p-4">
                  <div className="w-10 h-10 rounded-xl flex items-center justify-center text-lg flex-shrink-0" style={{ background: `${meta.color}18` }}>{meta.icon}</div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <p className="font-medium text-sm" style={{ color: 'var(--text-primary)' }}>{inv.name}</p>
                      <span className="text-xs px-2 py-0.5 rounded-full font-medium" style={{ background: risk.bg, color: risk.text }}>{meta.riskLevel} risk</span>
                      {inv.status !== 'active' && <span className="text-xs px-2 py-0.5 rounded-full" style={{ background: 'rgba(255,255,255,0.07)', color: 'var(--text-muted)' }}>{inv.status}</span>}
                    </div>
                    <p className="text-xs mt-0.5" style={{ color: 'var(--text-muted)' }}>{meta.label} · {inv.expectedReturnPct}% p.a. · {inv.date.slice(0,7)}</p>
                  </div>
                  <p className="font-bold text-sm flex-shrink-0" style={{ color: 'var(--gold)' }}>{fmt(inv.amount)}</p>
                  <div className="flex items-center gap-1">
                    <select value={inv.status} onChange={e => updateStatus(inv.id, e.target.value as InvestmentStatus)}
                      className="text-xs rounded-lg px-2 py-1 border outline-none" style={{ background: 'var(--bg-card)', borderColor: 'var(--border)', color: 'var(--text-secondary)' }}>
                      <option value="active">Active</option>
                      <option value="matured">Matured</option>
                      <option value="withdrawn">Withdrawn</option>
                    </select>
                    <button onClick={() => { removeInvestment(inv.id); toast.success('Removed'); }} className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ color: 'var(--danger)' }}><Trash2 size={14} /></button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {showAdd && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4" style={{ background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(8px)' }} onClick={() => setShowAdd(false)}>
          <div className="card p-6 w-full max-w-md animate-fade-slide-up" onClick={e => e.stopPropagation()}>
            <h3 className="font-bold text-lg mb-5" style={{ fontFamily: 'Fraunces, serif' }}>Add Investment</h3>
            <div className="flex flex-col gap-3">
              <div><label className="label">Name</label><input className="input-field" placeholder="e.g. CIC MMF" value={form.name} onChange={e => setForm(f => ({...f, name: e.target.value}))} /></div>
              <div className="grid grid-cols-2 gap-3">
                <div><label className="label">Amount (KES)</label><input className="input-field" type="number" value={form.amount} onChange={e => setForm(f => ({...f, amount: e.target.value}))} /></div>
                <div><label className="label">Expected Return %</label><input className="input-field" type="number" placeholder={String(INVESTMENT_META[form.category].avgReturn)} value={form.expectedReturnPct} onChange={e => setForm(f => ({...f, expectedReturnPct: e.target.value}))} /></div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="label">Category</label>
                  <select className="input-field" value={form.category} onChange={e => setForm(f => ({...f, category: e.target.value as InvestmentCategory}))}>
                    {Object.entries(INVESTMENT_META).map(([k,v]) => <option key={k} value={k}>{v.icon} {v.label}</option>)}
                  </select>
                </div>
                <div><label className="label">Month</label><input className="input-field" type="month" value={form.date} onChange={e => setForm(f => ({...f, date: e.target.value}))} /></div>
              </div>
              <div><label className="label">Notes</label><input className="input-field" placeholder="Optional notes..." value={form.notes} onChange={e => setForm(f => ({...f, notes: e.target.value}))} /></div>
              <div className="grid grid-cols-2 gap-3 mt-2">
                <button onClick={() => setShowAdd(false)} className="btn-ghost py-2.5">Cancel</button>
                <button onClick={handleAdd} className="btn-gold py-2.5">Add</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
