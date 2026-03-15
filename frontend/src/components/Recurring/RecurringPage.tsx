import React, { useState, useEffect } from 'react';
import { RefreshCw, Check, X, Repeat, Loader } from 'lucide-react';
import { getCurrencySymbol } from '../../utils/currency';
import { CATEGORY_CONFIG } from '../../utils/categories';
import { RecurringPattern } from '../../types';
import toast from 'react-hot-toast';

const BACKEND_URL = import.meta.env.VITE_API_URL || '';
const KEY = 'finwise_recurring';

const load = (): RecurringPattern[] => { try { return JSON.parse(localStorage.getItem(KEY) || '[]'); } catch { return []; } };

function detectPatterns(transactions: any[]): RecurringPattern[] {
  const groups: Record<string, any[]> = {};
  transactions.filter(t => t.type === 'expense').forEach(t => {
    const key = t.description.toLowerCase().trim();
    groups[key] = groups[key] || [];
    groups[key].push(t);
  });

  const patterns: RecurringPattern[] = [];
  Object.entries(groups).forEach(([desc, txs]) => {
    if (txs.length < 2) return;
    const amounts = txs.map((t: any) => t.amount);
    const avgAmount = amounts.reduce((s: number, a: number) => s + a, 0) / amounts.length;
    const variance = amounts.reduce((s: number, a: number) => s + Math.abs(a - avgAmount), 0) / amounts.length;
    if (variance / avgAmount > 0.3) return; // Too variable

    const dates = txs.map((t: any) => new Date(t.date).getTime()).sort();
    const gaps: number[] = [];
    for (let i = 1; i < dates.length; i++) gaps.push((dates[i] - dates[i-1]) / (1000 * 60 * 60 * 24));

    const avgGap = gaps.reduce((s, g) => s + g, 0) / gaps.length;
    let frequency: 'weekly' | 'monthly' | 'yearly' | null = null;
    let confidence = 0;

    if (avgGap >= 6 && avgGap <= 8) { frequency = 'weekly'; confidence = 90; }
    else if (avgGap >= 25 && avgGap <= 35) { frequency = 'monthly'; confidence = 85; }
    else if (avgGap >= 350 && avgGap <= 380) { frequency = 'yearly'; confidence = 80; }

    if (!frequency) return;

    const existing = load().find(p => p.description.toLowerCase() === desc);
    if (existing?.confirmed) return;

    patterns.push({
      id: Math.random().toString(36).slice(2),
      description: txs[0].description,
      amount: Math.round(avgAmount),
      category: txs[0].category,
      frequency,
      confidence,
      lastSeen: txs[txs.length - 1].date,
      confirmed: false,
    });
  });

  return patterns.sort((a, b) => b.confidence - a.confidence);
}

export default function RecurringPage() {
  const sym = getCurrencySymbol();
  const fmt = (n: number) => `${sym} ${n.toLocaleString('en-KE', { maximumFractionDigits: 0 })}`;
  const [patterns, setPatterns] = useState<RecurringPattern[]>(load);
  const [confirmed, setConfirmed] = useState<RecurringPattern[]>(() => load().filter(p => p.confirmed));
  const [loading, setLoading] = useState(false);
  const [fetchError, setFetchError] = useState('');
  const [scanned, setScanned] = useState(false);

  const scan = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${BACKEND_URL}/api/transactions/demo-user?limit=200`);
      const { transactions } = await res.json();
      const detected = detectPatterns(transactions);
      const all = [...detected, ...load().filter(p => p.confirmed)];
      localStorage.setItem(KEY, JSON.stringify(all));
      setPatterns(detected);
      setConfirmed(load().filter(p => p.confirmed));
      setScanned(true);
      toast.success(detected.length > 0 ? `Found ${detected.length} recurring patterns!` : 'No new patterns found');
    } catch {
      toast.error('Failed to scan transactions');
    } finally {
      setLoading(false);
    }
  };

  const confirm = (p: RecurringPattern) => {
    const updated = { ...p, confirmed: true };
    const all = [...load().filter(x => x.id !== p.id), updated];
    localStorage.setItem(KEY, JSON.stringify(all));
    setPatterns(prev => prev.filter(x => x.id !== p.id));
    setConfirmed(prev => [...prev, updated]);
    toast.success(`${p.description} marked as recurring`);
  };

  const dismiss = (id: string) => {
    const all = load().filter(p => p.id !== id);
    localStorage.setItem(KEY, JSON.stringify(all));
    setPatterns(prev => prev.filter(p => p.id !== id));
  };

  const freqLabel = { weekly: 'Weekly', monthly: 'Monthly', yearly: 'Yearly' };
  const freqColor = { weekly: 'var(--info)', monthly: 'var(--gold)', yearly: 'var(--purple)' };

  const monthlyImpact = confirmed
    .filter(p => p.frequency === 'monthly').reduce((s, p) => s + p.amount, 0)
    + confirmed.filter(p => p.frequency === 'weekly').reduce((s, p) => s + p.amount * 4, 0)
    + confirmed.filter(p => p.frequency === 'yearly').reduce((s, p) => s + p.amount / 12, 0);

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-start justify-between flex-wrap gap-3">
        <div>
          <h2 className="section-title">Recurring Transactions</h2>
          <p className="section-subtitle">Auto-detect subscriptions and regular payments</p>
        </div>
        <button onClick={scan} disabled={loading} className="btn-gold flex items-center gap-2 text-sm">
          {loading ? <Loader size={15} className="animate-spin" /> : <RefreshCw size={15} />}
          Scan Transactions
        </button>
      </div>

      {confirmed.length > 0 && (
        <div className="card p-4 flex items-center gap-3" style={{ background: 'rgba(201,168,76,0.05)', borderColor: 'rgba(201,168,76,0.2)' }}>
          <Repeat size={16} style={{ color: 'var(--gold)', flexShrink: 0 }} />
          <div>
            <p className="text-sm font-medium" style={{ color: 'var(--text-primary)' }}>
              {confirmed.length} recurring payments — {fmt(monthlyImpact)}/month
            </p>
            <p className="text-xs" style={{ color: 'var(--text-muted)' }}>These are confirmed regular payments from your transaction history</p>
          </div>
        </div>
      )}

      {/* Detected (unconfirmed) */}
      {patterns.length > 0 && (
        <>
          <h3 className="font-semibold text-sm px-1" style={{ color: 'var(--text-secondary)' }}>
            Detected Patterns — review and confirm
          </h3>
          <div className="flex flex-col gap-2">
            {patterns.map(p => {
              const meta = CATEGORY_CONFIG[p.category as keyof typeof CATEGORY_CONFIG];
              return (
                <div key={p.id} className="card p-4 flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl flex items-center justify-center text-lg flex-shrink-0"
                    style={{ background: `${meta?.color || '#94A3B8'}18` }}>{meta?.icon || '🔄'}</div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <p className="font-medium text-sm" style={{ color: 'var(--text-primary)' }}>{p.description}</p>
                      <span className="text-xs px-2 py-0.5 rounded-full font-medium"
                        style={{ background: `${freqColor[p.frequency]}18`, color: freqColor[p.frequency] }}>
                        {freqLabel[p.frequency]}
                      </span>
                    </div>
                    <p className="text-xs mt-0.5" style={{ color: 'var(--text-muted)' }}>
                      {fmt(p.amount)} · {p.confidence}% confidence · Last seen {new Date(p.lastSeen).toLocaleDateString()}
                    </p>
                  </div>
                  <p className="font-bold text-sm flex-shrink-0" style={{ color: 'var(--danger)' }}>{fmt(p.amount)}</p>
                  <div className="flex gap-1 flex-shrink-0">
                    <button onClick={() => confirm(p)} className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ color: 'var(--success)', background: 'rgba(52,211,153,0.1)' }}>
                      <Check size={14} />
                    </button>
                    <button onClick={() => dismiss(p.id)} className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ color: 'var(--danger)', background: 'rgba(248,113,113,0.1)' }}>
                      <X size={14} />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </>
      )}

      {/* Confirmed recurring */}
      {confirmed.length > 0 && (
        <>
          <h3 className="font-semibold text-sm px-1" style={{ color: 'var(--text-secondary)' }}>
            Confirmed Recurring ({confirmed.length})
          </h3>
          <div className="card overflow-hidden">
            <div className="divide-y" style={{ borderColor: 'var(--border)' }}>
              {confirmed.map(p => {
                const meta = CATEGORY_CONFIG[p.category as keyof typeof CATEGORY_CONFIG];
                return (
                  <div key={p.id} className="flex items-center gap-3 p-4">
                    <div className="w-9 h-9 rounded-xl flex items-center justify-center text-lg flex-shrink-0"
                      style={{ background: `${meta?.color || '#94A3B8'}18` }}>{meta?.icon || '🔄'}</div>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-sm truncate" style={{ color: 'var(--text-primary)' }}>{p.description}</p>
                      <p className="text-xs" style={{ color: 'var(--text-muted)' }}>{freqLabel[p.frequency]} · {meta?.label}</p>
                    </div>
                    <span className="text-xs px-2 py-0.5 rounded-full font-medium flex-shrink-0"
                      style={{ background: 'rgba(52,211,153,0.1)', color: 'var(--success)' }}>✓ Confirmed</span>
                    <p className="font-bold text-sm flex-shrink-0" style={{ color: 'var(--danger)' }}>{fmt(p.amount)}</p>
                  </div>
                );
              })}
            </div>
          </div>
        </>
      )}

      {!scanned && patterns.length === 0 && confirmed.length === 0 && (
        <div className="card p-16 text-center">
          <Repeat size={40} className="mx-auto mb-3 opacity-20" style={{ color: 'var(--gold)' }} />
          <p className="font-medium mb-2" style={{ color: 'var(--text-secondary)' }}>No patterns detected yet</p>
          <p className="text-sm mb-6" style={{ color: 'var(--text-muted)' }}>Click "Scan Transactions" to detect recurring payments</p>
          <button onClick={scan} className="btn-gold px-6 py-2.5 mx-auto flex items-center gap-2 text-sm">
            <RefreshCw size={15} /> Scan Now
          </button>
        </div>
      )}
    </div>
  );
}
