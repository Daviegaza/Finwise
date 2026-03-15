import React, { useState, useMemo } from 'react';
import { Plus, Trash2, CreditCard, TrendingDown } from 'lucide-react';
import { getCurrencySymbol } from '../../utils/currency';
import { Debt } from '../../types';
import toast from 'react-hot-toast';

const KEY = 'finwise_debts';
const load = (): Debt[] => { try { return JSON.parse(localStorage.getItem(KEY) || '[]'); } catch { return []; } };
const DEBT_CATS = ['credit_card','personal_loan','student_loan','mortgage','car_loan','sacco_loan','other'] as const;
const DEBT_LABELS: Record<string, string> = {
  credit_card:'Credit Card', personal_loan:'Personal Loan', student_loan:'Student Loan',
  mortgage:'Mortgage', car_loan:'Car Loan', sacco_loan:'SACCO Loan', other:'Other'
};
const DEBT_ICONS: Record<string, string> = {
  credit_card:'💳', personal_loan:'💰', student_loan:'📚', mortgage:'🏠', car_loan:'🚗', sacco_loan:'🏦', other:'📋'
};

function calcPayoff(debts: Debt[], extra: number, method: 'avalanche'|'snowball') {
  if (debts.length === 0) return { months: 0, totalInterest: 0, schedule: [] };
  let remaining = debts.map(d => ({ ...d, balance: d.balance }));
  const sorted = method === 'avalanche'
    ? [...remaining].sort((a,b) => b.interestRate - a.interestRate)
    : [...remaining].sort((a,b) => a.balance - b.balance);

  let months = 0;
  let totalInterest = 0;
  const maxMonths = 600;

  while (sorted.some(d => d.balance > 0) && months < maxMonths) {
    months++;
    let extraLeft = extra;
    for (const debt of sorted) {
      if (debt.balance <= 0) continue;
      const interest = debt.balance * (debt.interestRate / 100 / 12);
      totalInterest += interest;
      debt.balance += interest;
      const payment = Math.min(debt.balance, debt.minimumPayment + (sorted.find(d => d.balance > 0) === debt ? extraLeft : 0));
      debt.balance = Math.max(0, debt.balance - payment);
      if (debt.balance === 0) extraLeft += debt.minimumPayment;
    }
  }
  return { months, totalInterest };
}

export default function DebtPage() {
  const sym = getCurrencySymbol();
  const fmt = (n: number) => `${sym} ${Math.abs(n).toLocaleString('en-KE', { maximumFractionDigits: 0 })}`;
  const [debts, setDebts] = useState<Debt[]>(load);
  const [extra, setExtra] = useState(0);
  const [method, setMethod] = useState<'avalanche'|'snowball'>('avalanche');
  const [showAdd, setShowAdd] = useState(false);
  const [form, setForm] = useState({ name:'', balance:'', interestRate:'', minimumPayment:'', category:'personal_loan' as Debt['category'] });

  const save = (d: Debt[]) => { setDebts(d); localStorage.setItem(KEY, JSON.stringify(d)); };

  const avalanche = useMemo(() => calcPayoff(debts, extra, 'avalanche'), [debts, extra]);
  const snowball = useMemo(() => calcPayoff(debts, extra, 'snowball'), [debts, extra]);
  const current = method === 'avalanche' ? avalanche : snowball;

  const totalDebt = debts.reduce((s,d) => s+d.balance, 0);
  const minPayments = debts.reduce((s,d) => s+d.minimumPayment, 0);

  const handleAdd = () => {
    if (!form.name || !form.balance || !form.interestRate || !form.minimumPayment) return toast.error('Fill all fields');
    const debt: Debt = { id: Date.now().toString(), name: form.name, balance: parseFloat(form.balance), interestRate: parseFloat(form.interestRate), minimumPayment: parseFloat(form.minimumPayment), category: form.category };
    save([...debts, debt]);
    setForm({ name:'', balance:'', interestRate:'', minimumPayment:'', category:'personal_loan' });
    setShowAdd(false);
    toast.success('Debt added');
  };

  const yrs = Math.floor(current.months / 12);
  const mos = current.months % 12;

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-start justify-between flex-wrap gap-3">
        <div>
          <h2 className="section-title">Debt Payoff Planner</h2>
          <p className="section-subtitle">Avalanche vs snowball — find your fastest path to freedom</p>
        </div>
        <button onClick={() => setShowAdd(true)} className="btn-gold flex items-center gap-2 text-sm">
          <Plus size={16} /> Add Debt
        </button>
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          { label: 'Total Debt', val: fmt(totalDebt), color: 'var(--danger)' },
          { label: 'Min Payments/mo', val: fmt(minPayments), color: 'var(--warning)' },
          { label: 'Payoff Time', val: current.months > 0 ? `${yrs > 0 ? yrs+'y ' : ''}${mos}m` : '—', color: 'var(--info)' },
          { label: 'Total Interest', val: current.months > 0 ? fmt(current.totalInterest) : '—', color: 'var(--purple)' },
        ].map(s => (
          <div key={s.label} className="card p-4">
            <p className="text-xs mb-1" style={{ color: 'var(--text-muted)' }}>{s.label}</p>
            <p className="text-xl font-bold" style={{ color: s.color, fontFamily: 'Fraunces, serif' }}>{s.val}</p>
          </div>
        ))}
      </div>

      {debts.length > 0 && (
        <div className="card p-5 flex flex-col gap-4">
          <h3 className="font-semibold text-sm" style={{ color: 'var(--text-secondary)' }}>Payoff Strategy</h3>

          {/* Method toggle */}
          <div className="grid grid-cols-2 gap-3">
            {(['avalanche','snowball'] as const).map(m => (
              <button key={m} onClick={() => setMethod(m)}
                className="p-3 rounded-xl border text-left transition-all"
                style={{ background: method === m ? 'rgba(201,168,76,0.08)' : 'rgba(255,255,255,0.02)', borderColor: method === m ? 'rgba(201,168,76,0.4)' : 'var(--border)' }}>
                <p className="font-semibold text-sm capitalize mb-1" style={{ color: method === m ? 'var(--gold)' : 'var(--text-primary)' }}>{m}</p>
                <p className="text-xs" style={{ color: 'var(--text-muted)' }}>
                  {m === 'avalanche' ? 'Pay highest interest first — saves most money' : 'Pay smallest balance first — most motivating'}
                </p>
                {m === 'avalanche' && avalanche.months < snowball.months && (
                  <span className="text-xs mt-1 px-2 py-0.5 rounded-full inline-block" style={{ background: 'rgba(52,211,153,0.12)', color: 'var(--success)' }}>Saves most</span>
                )}
              </button>
            ))}
          </div>

          {/* Extra payment slider */}
          <div>
            <div className="flex justify-between mb-2">
              <label className="text-sm font-medium" style={{ color: 'var(--text-secondary)' }}>Extra monthly payment</label>
              <span className="font-bold text-sm" style={{ color: 'var(--gold)' }}>{fmt(extra)}</span>
            </div>
            <input type="range" min="0" max="50000" step="500" value={extra} onChange={e => setExtra(parseInt(e.target.value))} className="w-full" />
            <div className="flex justify-between text-xs mt-1" style={{ color: 'var(--text-muted)' }}>
              <span>{fmt(0)}</span><span>{fmt(50000)}</span>
            </div>
          </div>

          {/* Interest savings vs no extra payment */}
          {extra > 0 && (
            <div className="p-3 rounded-xl flex items-center gap-3" style={{ background: 'rgba(52,211,153,0.06)', border: '1px solid rgba(52,211,153,0.2)' }}>
              <TrendingDown size={16} style={{ color: 'var(--success)', flexShrink: 0 }} />
              <p className="text-xs" style={{ color: 'var(--success)' }}>
                With {fmt(extra)} extra/month, you save {fmt(calcPayoff(debts, 0, method).totalInterest - current.totalInterest)} in interest and pay off {calcPayoff(debts, 0, method).months - current.months} months earlier.
              </p>
            </div>
          )}
        </div>
      )}

      {/* Debt list */}
      <div className="card overflow-hidden">
        {debts.length === 0 ? (
          <div className="p-16 text-center">
            <CreditCard size={40} className="mx-auto mb-3 opacity-20" style={{ color: 'var(--gold)' }} />
            <p className="font-medium mb-1" style={{ color: 'var(--text-secondary)' }}>No debts added</p>
            <p className="text-sm" style={{ color: 'var(--text-muted)' }}>Add your loans, credit cards and SACCO loans</p>
          </div>
        ) : (
          <div className="divide-y" style={{ borderColor: 'var(--border)' }}>
            {debts.map((d, i) => {
              const pct = totalDebt > 0 ? (d.balance / totalDebt) * 100 : 0;
              return (
                <div key={d.id} className="p-4 flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl flex items-center justify-center text-lg flex-shrink-0"
                    style={{ background: 'rgba(248,113,113,0.1)' }}>{DEBT_ICONS[d.category] || '💰'}</div>
                  <div className="flex-1 min-w-0">
                    <div className="flex justify-between mb-1">
                      <p className="font-medium text-sm" style={{ color: 'var(--text-primary)' }}>{d.name}</p>
                      <p className="font-bold text-sm" style={{ color: 'var(--danger)' }}>{fmt(d.balance)}</p>
                    </div>
                    <div className="h-1.5 rounded-full mb-1" style={{ background: 'rgba(255,255,255,0.06)' }}>
                      <div className="h-full rounded-full" style={{ width: `${pct}%`, background: 'var(--danger)' }} />
                    </div>
                    <p className="text-xs" style={{ color: 'var(--text-muted)' }}>
                      {d.interestRate}% p.a. · Min {fmt(d.minimumPayment)}/mo · {DEBT_LABELS[d.category]}
                    </p>
                  </div>
                  <button onClick={() => { save(debts.filter(x => x.id !== d.id)); toast.success('Removed'); }}
                    className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0" style={{ color: 'var(--danger)' }}>
                    <Trash2 size={14} />
                  </button>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {showAdd && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4"
          style={{ background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(8px)' }} onClick={() => setShowAdd(false)}>
          <div className="card p-6 w-full max-w-md animate-fade-slide-up" onClick={e => e.stopPropagation()}>
            <h3 className="font-bold text-lg mb-5" style={{ fontFamily: 'Fraunces, serif' }}>Add Debt</h3>
            <div className="flex flex-col gap-3">
              <div><label className="label">Name</label><input className="input-field" placeholder="e.g. Equity Bank Loan" value={form.name} onChange={e => setForm(f => ({...f, name: e.target.value}))} /></div>
              <div className="grid grid-cols-2 gap-3">
                <div><label className="label">Balance ({sym})</label><input className="input-field" type="number" value={form.balance} onChange={e => setForm(f => ({...f, balance: e.target.value}))} /></div>
                <div><label className="label">Interest Rate %</label><input className="input-field" type="number" step="0.1" placeholder="e.g. 14" value={form.interestRate} onChange={e => setForm(f => ({...f, interestRate: e.target.value}))} /></div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div><label className="label">Min Payment/mo</label><input className="input-field" type="number" value={form.minimumPayment} onChange={e => setForm(f => ({...f, minimumPayment: e.target.value}))} /></div>
                <div>
                  <label className="label">Type</label>
                  <select className="input-field" value={form.category} onChange={e => setForm(f => ({...f, category: e.target.value as Debt['category']}))}>
                    {DEBT_CATS.map(c => <option key={c} value={c}>{DEBT_ICONS[c]} {DEBT_LABELS[c]}</option>)}
                  </select>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3 mt-1">
                <button onClick={() => setShowAdd(false)} className="btn-ghost py-2.5">Cancel</button>
                <button onClick={handleAdd} className="btn-gold py-2.5">Add Debt</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
