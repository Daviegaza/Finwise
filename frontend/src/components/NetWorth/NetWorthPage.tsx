import { getCurrencySymbol } from '../../utils/currency';
import React, { useState } from 'react';
import { Plus, Trash2, Landmark, TrendingUp, TrendingDown } from 'lucide-react';
import { useNetWorth } from '../../hooks/useNetWorth';
import { ASSET_META, LIABILITY_META } from '../../utils/netWorth';
import type { AssetCategory, LiabilityCategory } from '../../types';
import toast from 'react-hot-toast';


export default function NetWorthPage() {
  const sym = getCurrencySymbol();
  const fmt = (n: number) => `${sym} ${Math.abs(n).toLocaleString('en-KE', { maximumFractionDigits: 0 })}`;
  const { items, summary, addItem, removeItem, updateAmount } = useNetWorth();
  const [showAdd, setShowAdd] = useState(false);
  const [type, setType] = useState<'asset'|'liability'>('asset');
  const [form, setForm] = useState({ name: '', amount: '', category: 'cash' as AssetCategory | LiabilityCategory, notes: '' });

  const assets = items.filter(i => i.type === 'asset');
  const liabilities = items.filter(i => i.type === 'liability');

  const handleAdd = () => {
    if (!form.name || !form.amount) return toast.error('Name and amount required');
    addItem({ name: form.name, amount: parseFloat(form.amount), category: form.category, type, notes: form.notes });
    setForm({ name: '', amount: '', category: 'cash', notes: '' });
    setShowAdd(false);
    toast.success(`${type === 'asset' ? 'Asset' : 'Liability'} added!`);
  };

  const nwColor = summary.netWorth >= 0 ? 'var(--success)' : 'var(--danger)';

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-start justify-between flex-wrap gap-3">
        <div>
          <h2 className="section-title">Net Worth</h2>
          <p className="section-subtitle">Assets minus liabilities = your true wealth</p>
        </div>
        <button onClick={() => setShowAdd(true)} className="btn-gold flex items-center gap-2 text-sm">
          <Plus size={16} /> Add Item
        </button>
      </div>

      {/* Net worth hero */}
      <div className="card p-6 text-center" style={{ background: 'linear-gradient(135deg, rgba(201,168,76,0.08), rgba(201,168,76,0.03))' }}>
        <p className="text-sm mb-2" style={{ color: 'var(--text-muted)' }}>Your Net Worth</p>
        <p className="text-5xl font-bold mb-1" style={{ color: nwColor, fontFamily: 'Fraunces, serif' }}>
          {summary.netWorth >= 0 ? '' : '-'}{fmt(summary.netWorth)}
        </p>
        <p className="text-sm" style={{ color: 'var(--text-muted)' }}>
          Assets {fmt(summary.totalAssets)} · Liabilities {fmt(summary.totalLiabilities)}
        </p>
      </div>

      <div className="grid sm:grid-cols-2 gap-4">
        {/* Assets */}
        <div className="card overflow-hidden">
          <div className="flex items-center gap-2 px-5 py-4 border-b" style={{ borderColor: 'var(--border)' }}>
            <TrendingUp size={16} style={{ color: 'var(--success)' }} />
            <h3 className="font-semibold text-sm" style={{ color: 'var(--text-primary)' }}>Assets</h3>
            <span className="ml-auto font-bold text-sm" style={{ color: 'var(--success)' }}>{fmt(summary.totalAssets)}</span>
          </div>
          {assets.length === 0 ? (
            <p className="p-8 text-center text-sm" style={{ color: 'var(--text-muted)' }}>No assets added yet</p>
          ) : (
            <div className="divide-y" style={{ borderColor: 'var(--border)' }}>
              {assets.map(item => {
                const meta = ASSET_META[item.category as AssetCategory];
                return (
                  <div key={item.id} className="flex items-center gap-3 px-4 py-3">
                    <span className="text-lg">{meta?.icon || '💰'}</span>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate" style={{ color: 'var(--text-primary)' }}>{item.name}</p>
                      <p className="text-xs" style={{ color: 'var(--text-muted)' }}>{meta?.label}</p>
                    </div>
                    <p className="text-sm font-semibold flex-shrink-0" style={{ color: 'var(--success)' }}>{fmt(item.amount)}</p>
                    <button onClick={() => { removeItem(item.id); toast.success('Removed'); }} className="w-7 h-7 rounded-lg flex items-center justify-center opacity-50 hover:opacity-100" style={{ color: 'var(--danger)' }}><Trash2 size={13} /></button>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Liabilities */}
        <div className="card overflow-hidden">
          <div className="flex items-center gap-2 px-5 py-4 border-b" style={{ borderColor: 'var(--border)' }}>
            <TrendingDown size={16} style={{ color: 'var(--danger)' }} />
            <h3 className="font-semibold text-sm" style={{ color: 'var(--text-primary)' }}>Liabilities</h3>
            <span className="ml-auto font-bold text-sm" style={{ color: 'var(--danger)' }}>{fmt(summary.totalLiabilities)}</span>
          </div>
          {liabilities.length === 0 ? (
            <p className="p-8 text-center text-sm" style={{ color: 'var(--text-muted)' }}>No liabilities added yet</p>
          ) : (
            <div className="divide-y" style={{ borderColor: 'var(--border)' }}>
              {liabilities.map(item => {
                const meta = LIABILITY_META[item.category as LiabilityCategory];
                return (
                  <div key={item.id} className="flex items-center gap-3 px-4 py-3">
                    <span className="text-lg">{meta?.icon || '💳'}</span>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate" style={{ color: 'var(--text-primary)' }}>{item.name}</p>
                      <p className="text-xs" style={{ color: 'var(--text-muted)' }}>{meta?.label}</p>
                    </div>
                    <p className="text-sm font-semibold flex-shrink-0" style={{ color: 'var(--danger)' }}>{fmt(item.amount)}</p>
                    <button onClick={() => { removeItem(item.id); toast.success('Removed'); }} className="w-7 h-7 rounded-lg flex items-center justify-center opacity-50 hover:opacity-100" style={{ color: 'var(--danger)' }}><Trash2 size={13} /></button>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {showAdd && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4" style={{ background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(8px)' }} onClick={() => setShowAdd(false)}>
          <div className="card p-6 w-full max-w-md animate-fade-slide-up" onClick={e => e.stopPropagation()}>
            <h3 className="font-bold text-lg mb-4" style={{ fontFamily: 'Fraunces, serif' }}>Add Item</h3>
            <div className="grid grid-cols-2 gap-2 p-1 rounded-xl mb-4" style={{ background: 'rgba(255,255,255,0.04)' }}>
              {(['asset','liability'] as const).map(t => (
                <button key={t} onClick={() => { setType(t); setForm(f => ({...f, category: t === 'asset' ? 'cash' : 'mortgage'})); }}
                  className="py-2 rounded-lg text-sm font-medium transition-all capitalize"
                  style={{ background: type === t ? (t === 'asset' ? 'rgba(52,211,153,0.2)' : 'rgba(248,113,113,0.2)') : 'none', color: type === t ? (t === 'asset' ? 'var(--success)' : 'var(--danger)') : 'var(--text-muted)' }}>
                  {t}
                </button>
              ))}
            </div>
            <div className="flex flex-col gap-3">
              <div><label className="label">Name</label><input className="input-field" placeholder="e.g. M-Pesa savings" value={form.name} onChange={e => setForm(f => ({...f, name: e.target.value}))} /></div>
              <div className="grid grid-cols-2 gap-3">
                <div><label className="label">Amount (KES)</label><input className="input-field" type="number" value={form.amount} onChange={e => setForm(f => ({...f, amount: e.target.value}))} /></div>
                <div>
                  <label className="label">Category</label>
                  <select className="input-field" value={form.category} onChange={e => setForm(f => ({...f, category: e.target.value as AssetCategory | LiabilityCategory}))}>
                    {type === 'asset'
                      ? Object.entries(ASSET_META).map(([k,v]) => <option key={k} value={k}>{v.icon} {v.label}</option>)
                      : Object.entries(LIABILITY_META).map(([k,v]) => <option key={k} value={k}>{v.icon} {v.label}</option>)}
                  </select>
                </div>
              </div>
              <div><label className="label">Notes</label><input className="input-field" placeholder="Optional..." value={form.notes} onChange={e => setForm(f => ({...f, notes: e.target.value}))} /></div>
              <div className="grid grid-cols-2 gap-3 mt-1">
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
