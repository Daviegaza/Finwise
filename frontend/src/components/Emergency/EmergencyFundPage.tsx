import React, { useState } from 'react';
import { ShieldCheck, Plus, Minus, History } from 'lucide-react';
import { useEmergencyFund } from '../../hooks/useEmergencyFund';
import toast from 'react-hot-toast';

const fmt = (n: number) => `KSh ${n.toLocaleString('en-KE', { maximumFractionDigits: 0 })}`;

export default function EmergencyFundPage() {
  const monthlyExpenses = 35000; // TODO: pull from expenses hook
  const { data, targetAmount, progressPct, monthsCovered, deposit, withdraw, setTargetMonths, setCurrentAmount } = useEmergencyFund(monthlyExpenses);
  const [amount, setAmount] = useState('');
  const [note, setNote] = useState('');
  const [action, setAction] = useState<'deposit'|'withdraw'>('deposit');
  const [editTarget, setEditTarget] = useState(false);
  const [newAmount, setNewAmount] = useState('');

  const handleAction = () => {
    const val = parseFloat(amount);
    if (!val || val <= 0) return toast.error('Enter a valid amount');
    if (action === 'deposit') { deposit(val, note); toast.success(`Deposited ${fmt(val)}`); }
    else { withdraw(val, note); toast.success(`Withdrew ${fmt(val)}`); }
    setAmount(''); setNote('');
  };

  const statusColor = progressPct >= 100 ? 'var(--success)' : progressPct >= 60 ? 'var(--warning)' : 'var(--danger)';
  const statusLabel = progressPct >= 100 ? 'Fully Funded ✓' : progressPct >= 60 ? 'Getting There' : 'Build This First';

  return (
    <div className="flex flex-col gap-4 max-w-2xl">
      <div>
        <h2 className="section-title">Emergency Fund</h2>
        <p className="section-subtitle">Your financial safety net for unexpected events</p>
      </div>

      {/* Hero card */}
      <div className="card p-6">
        <div className="flex items-start justify-between mb-6 flex-wrap gap-3">
          <div>
            <p className="text-sm mb-1" style={{ color: 'var(--text-muted)' }}>Current Balance</p>
            <p className="text-4xl font-bold" style={{ color: 'var(--gold)', fontFamily: 'Fraunces, serif' }}>{fmt(data.currentAmount)}</p>
            <p className="text-sm mt-1" style={{ color: 'var(--text-muted)' }}>Target: {fmt(targetAmount)}</p>
          </div>
          <div className="text-right">
            <span className="px-3 py-1.5 rounded-full text-sm font-semibold" style={{ background: `${statusColor}15`, color: statusColor }}>{statusLabel}</span>
            <p className="text-xs mt-2" style={{ color: 'var(--text-muted)' }}>{monthsCovered} months covered</p>
          </div>
        </div>

        {/* Progress */}
        <div className="mb-4">
          <div className="flex justify-between text-xs mb-2">
            <span style={{ color: 'var(--text-muted)' }}>Progress</span>
            <span style={{ color: statusColor }}>{progressPct}%</span>
          </div>
          <div className="h-3 rounded-full" style={{ background: 'rgba(255,255,255,0.07)' }}>
            <div className="h-full rounded-full transition-all duration-700" style={{ width: `${progressPct}%`, background: `linear-gradient(90deg, ${statusColor}88, ${statusColor})` }} />
          </div>
        </div>

        {/* Target months */}
        <div className="flex items-center gap-3 flex-wrap">
          <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>Target months:</p>
          {[3, 6, 9, 12].map(m => (
            <button key={m} onClick={() => setTargetMonths(m)}
              className="px-3 py-1 rounded-lg text-sm font-medium transition-all"
              style={{ background: data.targetMonths === m ? 'rgba(201,168,76,0.15)' : 'rgba(255,255,255,0.05)', color: data.targetMonths === m ? 'var(--gold)' : 'var(--text-muted)', border: `1px solid ${data.targetMonths === m ? 'rgba(201,168,76,0.3)' : 'transparent'}` }}>
              {m}mo
            </button>
          ))}
        </div>
      </div>

      {/* Deposit / Withdraw */}
      <div className="card p-5">
        <div className="grid grid-cols-2 gap-2 p-1 rounded-xl mb-4" style={{ background: 'rgba(255,255,255,0.04)' }}>
          {(['deposit','withdraw'] as const).map(a => (
            <button key={a} onClick={() => setAction(a)}
              className="py-2 rounded-lg text-sm font-medium capitalize transition-all"
              style={{ background: action === a ? (a === 'deposit' ? 'rgba(52,211,153,0.2)' : 'rgba(248,113,113,0.2)') : 'none', color: action === a ? (a === 'deposit' ? 'var(--success)' : 'var(--danger)') : 'var(--text-muted)' }}>
              {a === 'deposit' ? <><Plus size={13} className="inline mr-1" />Deposit</> : <><Minus size={13} className="inline mr-1" />Withdraw</>}
            </button>
          ))}
        </div>
        <div className="flex flex-col gap-3">
          <div><label className="label">Amount (KES)</label><input className="input-field" type="number" placeholder="0" value={amount} onChange={e => setAmount(e.target.value)} onKeyDown={e => e.key === 'Enter' && handleAction()} /></div>
          <div><label className="label">Note (optional)</label><input className="input-field" placeholder="e.g. Monthly contribution" value={note} onChange={e => setNote(e.target.value)} /></div>
          <button onClick={handleAction} className="btn-gold py-3" style={{ background: action === 'withdraw' ? 'linear-gradient(135deg, #F87171, #EF4444)' : undefined }}>
            {action === 'deposit' ? 'Add to Fund' : 'Withdraw from Fund'}
          </button>
        </div>
      </div>

      {/* History */}
      {data.contributions.length > 0 && (
        <div className="card overflow-hidden">
          <div className="flex items-center gap-2 px-5 py-4 border-b" style={{ borderColor: 'var(--border)' }}>
            <History size={15} style={{ color: 'var(--gold)' }} />
            <h3 className="font-semibold text-sm">Transaction History</h3>
          </div>
          <div className="divide-y" style={{ borderColor: 'var(--border)' }}>
            {data.contributions.slice(0, 10).map(c => (
              <div key={c.id} className="flex items-center justify-between px-5 py-3">
                <div>
                  <p className="text-sm" style={{ color: 'var(--text-primary)' }}>{c.note || (c.amount > 0 ? 'Deposit' : 'Withdrawal')}</p>
                  <p className="text-xs" style={{ color: 'var(--text-muted)' }}>{c.date}</p>
                </div>
                <p className="font-semibold text-sm" style={{ color: c.amount > 0 ? 'var(--success)' : 'var(--danger)' }}>
                  {c.amount > 0 ? '+' : ''}{fmt(c.amount)}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
