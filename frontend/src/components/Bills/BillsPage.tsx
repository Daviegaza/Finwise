import React, { useState } from 'react';
import { Plus, Check, RotateCcw, Trash2, Receipt, AlertTriangle } from 'lucide-react';
import { useBills } from '../../hooks/useBills';
import { BILL_META, getDaysUntilDue } from '../../utils/bills';
import type { BillCategory, BillFrequency } from '../../types';
import toast from 'react-hot-toast';

const fmt = (n: number) => `KSh ${n.toLocaleString('en-KE', { maximumFractionDigits: 0 })}`;

export default function BillsPage() {
  const { bills, sortedBills, monthlyTotal, upcomingThisWeek, overdueCount, addBill, removeBill, markPaid, markUnpaid } = useBills();
  const [showAdd, setShowAdd] = useState(false);
  const [filter, setFilter] = useState<'all'|'upcoming'|'paid'|'overdue'>('all');
  const [form, setForm] = useState({ name: '', amount: '', category: 'rent' as BillCategory, dueDay: '1', frequency: 'monthly' as BillFrequency, notes: '' });

  const handleAdd = () => {
    if (!form.name || !form.amount) return toast.error('Name and amount required');
    addBill({ name: form.name, amount: parseFloat(form.amount), category: form.category, dueDay: parseInt(form.dueDay), frequency: form.frequency, status: 'upcoming', notes: form.notes, isRecurring: true });
    setForm({ name: '', amount: '', category: 'rent', dueDay: '1', frequency: 'monthly', notes: '' });
    setShowAdd(false);
    toast.success('Bill added!');
  };

  const filtered = filter === 'all' ? sortedBills : sortedBills.filter(b => b.status === filter);

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-start justify-between flex-wrap gap-3">
        <div>
          <h2 className="section-title">Bills & Recurring</h2>
          <p className="section-subtitle">Track all your fixed monthly obligations</p>
        </div>
        <button onClick={() => setShowAdd(true)} className="btn-gold flex items-center gap-2 text-sm">
          <Plus size={16} /> Add Bill
        </button>
      </div>

      {/* Summary */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          { label: 'Monthly Total',  val: fmt(monthlyTotal),          color: 'var(--gold)' },
          { label: 'Total Bills',    val: bills.length,               color: 'var(--info)' },
          { label: 'Due This Week',  val: upcomingThisWeek.length,    color: 'var(--warning)' },
          { label: 'Overdue',        val: overdueCount, color: overdueCount > 0 ? 'var(--danger)' : 'var(--success)' },
        ].map(s => (
          <div key={s.label} className="card p-4">
            <p className="text-xs mb-1" style={{ color: 'var(--text-muted)' }}>{s.label}</p>
            <p className="text-2xl font-bold" style={{ color: s.color, fontFamily: 'Fraunces, serif' }}>{s.val}</p>
          </div>
        ))}
      </div>

      {/* Filter tabs */}
      <div className="flex gap-2 flex-wrap">
        {(['all','upcoming','paid','overdue'] as const).map(f => (
          <button key={f} onClick={() => setFilter(f)}
            className="px-4 py-1.5 rounded-lg text-sm font-medium capitalize transition-all"
            style={{ background: filter === f ? 'rgba(201,168,76,0.15)' : 'rgba(255,255,255,0.04)', color: filter === f ? 'var(--gold)' : 'var(--text-muted)', border: `1px solid ${filter === f ? 'rgba(201,168,76,0.3)' : 'transparent'}` }}>
            {f}
          </button>
        ))}
      </div>

      {/* Bills list */}
      <div className="card overflow-hidden">
        {filtered.length === 0 ? (
          <div className="p-16 text-center">
            <Receipt size={40} className="mx-auto mb-3 opacity-20" style={{ color: 'var(--gold)' }} />
            <p className="font-medium mb-1" style={{ color: 'var(--text-secondary)' }}>{bills.length === 0 ? 'No bills yet' : `No ${filter} bills`}</p>
            <p className="text-sm" style={{ color: 'var(--text-muted)' }}>{bills.length === 0 ? 'Add rent, utilities, loans & subscriptions' : 'Try a different filter'}</p>
          </div>
        ) : (
          <div className="divide-y" style={{ borderColor: 'var(--border)' }}>
            {filtered.map(bill => {
              const meta = BILL_META[bill.category];
              const days = getDaysUntilDue(bill.dueDay);
              const isOverdue = bill.status === 'overdue';
              const isPaid = bill.status === 'paid';
              return (
                <div key={bill.id} className="flex items-center gap-3 p-4 transition-colors"
                  style={{ background: isOverdue ? 'rgba(248,113,113,0.03)' : 'transparent' }}>
                  <div className="w-10 h-10 rounded-xl flex items-center justify-center text-lg flex-shrink-0"
                    style={{ background: `${meta.color}18` }}>{meta.icon}</div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <p className="font-medium text-sm" style={{ color: isPaid ? 'var(--text-muted)' : 'var(--text-primary)', textDecoration: isPaid ? 'line-through' : 'none' }}>{bill.name}</p>
                      {isOverdue && <span className="flex items-center gap-1 text-xs font-semibold px-2 py-0.5 rounded-full" style={{ background: 'rgba(248,113,113,0.15)', color: 'var(--danger)' }}><AlertTriangle size={10} />Overdue</span>}
                      {isPaid && <span className="text-xs font-semibold px-2 py-0.5 rounded-full" style={{ background: 'rgba(52,211,153,0.12)', color: 'var(--success)' }}>Paid ✓</span>}
                    </div>
                    <p className="text-xs mt-0.5" style={{ color: 'var(--text-muted)' }}>
                      Day {bill.dueDay} · {meta.label} · {bill.frequency}
                      {!isPaid && <span style={{ color: isOverdue ? 'var(--danger)' : days <= 3 ? 'var(--warning)' : 'var(--text-muted)' }}> · {isOverdue ? 'Overdue!' : `${days}d left`}</span>}
                    </p>
                  </div>
                  <p className="font-bold text-sm flex-shrink-0" style={{ color: isPaid ? 'var(--text-muted)' : 'var(--text-primary)' }}>{fmt(bill.amount)}</p>
                  <div className="flex items-center gap-1 flex-shrink-0">
                    {isPaid
                      ? <button onClick={() => markUnpaid(bill.id)} className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ color: 'var(--text-muted)' }} title="Mark unpaid"><RotateCcw size={14} /></button>
                      : <button onClick={() => { markPaid(bill.id); toast.success(`${bill.name} paid ✓`); }} className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ color: 'var(--success)' }} title="Mark paid"><Check size={14} /></button>
                    }
                    <button onClick={() => { removeBill(bill.id); toast.success('Removed'); }} className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ color: 'var(--danger)' }}><Trash2 size={14} /></button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Add modal */}
      {showAdd && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4"
          style={{ background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(8px)' }}
          onClick={() => setShowAdd(false)}>
          <div className="card p-6 w-full max-w-md animate-fade-slide-up" onClick={e => e.stopPropagation()}>
            <h3 className="font-bold text-lg mb-5" style={{ fontFamily: 'Fraunces, serif' }}>Add Bill</h3>
            <div className="flex flex-col gap-3">
              <div className="grid grid-cols-2 gap-3">
                <div><label className="label">Bill Name</label><input className="input-field" placeholder="e.g. Netflix" value={form.name} onChange={e => setForm(f => ({...f, name: e.target.value}))} /></div>
                <div><label className="label">Amount (KES)</label><input className="input-field" type="number" placeholder="0" value={form.amount} onChange={e => setForm(f => ({...f, amount: e.target.value}))} /></div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="label">Category</label>
                  <select className="input-field" value={form.category} onChange={e => setForm(f => ({...f, category: e.target.value as BillCategory}))}>
                    {Object.entries(BILL_META).map(([k,v]) => <option key={k} value={k}>{v.icon} {v.label}</option>)}
                  </select>
                </div>
                <div>
                  <label className="label">Frequency</label>
                  <select className="input-field" value={form.frequency} onChange={e => setForm(f => ({...f, frequency: e.target.value as BillFrequency}))}>
                    <option value="weekly">Weekly</option>
                    <option value="monthly">Monthly</option>
                    <option value="quarterly">Quarterly</option>
                    <option value="annually">Annually</option>
                  </select>
                </div>
              </div>
              <div><label className="label">Due Day of Month</label><input className="input-field" type="number" min="1" max="31" value={form.dueDay} onChange={e => setForm(f => ({...f, dueDay: e.target.value}))} /></div>
              <div><label className="label">Notes (optional)</label><input className="input-field" placeholder="Any notes..." value={form.notes} onChange={e => setForm(f => ({...f, notes: e.target.value}))} /></div>
              <div className="grid grid-cols-2 gap-3 mt-1">
                <button onClick={() => setShowAdd(false)} className="btn-ghost py-2.5">Cancel</button>
                <button onClick={handleAdd} className="btn-gold py-2.5">Add Bill</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
