import React, { useState } from 'react';
import { Plus, Search, Filter, Trash2, ArrowUpRight, ArrowDownLeft, X } from 'lucide-react';
import { useTransactions } from '../../hooks';
import { Transaction, TransactionCategory } from '../../types';
import { CATEGORY_CONFIG, INCOME_CATEGORIES, EXPENSE_CATEGORIES, formatCurrency, formatDate } from '../../utils/categories';

interface AddTransactionModalProps {
  onClose: () => void;
  onAdd: (t: Omit<Transaction, 'id' | 'userId'>) => Promise<Transaction>;
  currencySymbol: string;
  currency: string;
}

function AddTransactionModal({ onClose, onAdd, currency }: AddTransactionModalProps) {
  const [form, setForm] = useState({
    type: 'expense' as 'income' | 'expense',
    amount: '',
    description: '',
    category: 'food' as TransactionCategory,
    date: new Date().toISOString().split('T')[0],
    merchant: '',
  });
  const [loading, setLoading] = useState(false);

  const categories = form.type === 'income' ? INCOME_CATEGORIES : EXPENSE_CATEGORIES;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.amount || !form.description) return;
    setLoading(true);
    try {
      await onAdd({
        amount: parseFloat(form.amount),
        currency,
        category: form.category,
        description: form.description,
        date: new Date(form.date).toISOString(),
        type: form.type,
        merchant: form.merchant,
      });
      onClose();
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4"
      style={{ background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(8px)' }}>
      <div className="w-full max-w-md card p-6 animate-fade-slide-up">
        <div className="flex items-center justify-between mb-6">
          <h3 className="font-bold text-lg" style={{ fontFamily: 'Fraunces, serif' }}>Add Transaction</h3>
          <button onClick={onClose} className="btn-ghost p-1.5 rounded-lg"><X size={18} /></button>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          {/* Type toggle */}
          <div className="grid grid-cols-2 gap-2 p-1 rounded-xl" style={{ background: 'rgba(255,255,255,0.04)' }}>
            {(['expense', 'income'] as const).map(t => (
              <button key={t} type="button" onClick={() => {
                setForm(f => ({ ...f, type: t, category: t === 'income' ? 'salary' : 'food' }));
              }}
                className="py-2.5 rounded-lg text-sm font-medium transition-all duration-200 capitalize"
                style={{
                  background: form.type === t ? (t === 'income' ? 'rgba(52,211,153,0.15)' : 'rgba(248,113,113,0.15)') : 'transparent',
                  color: form.type === t ? (t === 'income' ? 'var(--success)' : 'var(--danger)') : 'var(--text-muted)',
                  border: form.type === t ? `1px solid ${t === 'income' ? 'rgba(52,211,153,0.3)' : 'rgba(248,113,113,0.3)'}` : '1px solid transparent',
                }}>
                {t}
              </button>
            ))}
          </div>

          <div>
            <label className="label">Amount</label>
            <input className="input-field" type="number" step="0.01" min="0" placeholder="0.00"
              value={form.amount} onChange={e => setForm(f => ({ ...f, amount: e.target.value }))} required />
          </div>

          <div>
            <label className="label">Description</label>
            <input className="input-field" type="text" placeholder="What was this for?"
              value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} required />
          </div>

          <div>
            <label className="label">Category</label>
            <select className="input-field" value={form.category}
              onChange={e => setForm(f => ({ ...f, category: e.target.value as TransactionCategory }))}>
              {categories.map(c => (
                <option key={c} value={c} style={{ background: 'var(--bg-card)' }}>
                  {CATEGORY_CONFIG[c]?.icon} {CATEGORY_CONFIG[c]?.label}
                </option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="label">Date</label>
              <input className="input-field" type="date" value={form.date}
                onChange={e => setForm(f => ({ ...f, date: e.target.value }))} />
            </div>
            <div>
              <label className="label">Merchant (optional)</label>
              <input className="input-field" type="text" placeholder="e.g. Amazon"
                value={form.merchant} onChange={e => setForm(f => ({ ...f, merchant: e.target.value }))} />
            </div>
          </div>

          <div className="flex gap-3 pt-2">
            <button type="button" onClick={onClose} className="btn-ghost flex-1 py-3">Cancel</button>
            <button type="submit" disabled={loading} className="btn-gold flex-1 py-3 flex items-center justify-center gap-2">
              {loading ? <div className="w-4 h-4 border-2 border-t-transparent rounded-full animate-spin" style={{ borderColor: '#1A1000', borderTopColor: 'transparent' }} /> : <Plus size={16} />}
              Add Transaction
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

interface TransactionsPageProps {
  currencySymbol: string;
  currency: string;
}

export default function TransactionsPage({ currencySymbol, currency }: TransactionsPageProps) {
  const { transactions, total, loading, filters, setFilters, addTransaction, deleteTransaction } = useTransactions();
  const [showModal, setShowModal] = useState(false);
  const [search, setSearch] = useState('');
  const [showFilters, setShowFilters] = useState(false);

  const filtered = transactions.filter(t =>
    t.description.toLowerCase().includes(search.toLowerCase()) ||
    CATEGORY_CONFIG[t.category]?.label.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="flex flex-col gap-5">
      {/* Header */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <h2 className="section-title">Transactions</h2>
          <p className="section-subtitle">{total} total transactions</p>
        </div>
        <button onClick={() => setShowModal(true)} className="btn-gold flex items-center gap-2 flex-shrink-0">
          <Plus size={16} /> <span className="hidden sm:inline">Add</span>
        </button>
      </div>

      {/* Search & filters */}
      <div className="flex gap-2">
        <div className="flex-1 relative">
          <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: 'var(--text-muted)' }} />
          <input className="input-field pl-9" placeholder="Search transactions..."
            value={search} onChange={e => setSearch(e.target.value)} />
        </div>
        <button onClick={() => setShowFilters(!showFilters)}
          className={`btn-ghost p-3 rounded-xl flex items-center gap-2 ${showFilters ? 'border-gold-500' : ''}`}
          style={{ borderColor: showFilters ? 'var(--gold)' : undefined, color: showFilters ? 'var(--gold)' : undefined }}>
          <Filter size={16} />
          <span className="hidden sm:inline text-xs">Filter</span>
        </button>
      </div>

      {showFilters && (
        <div className="card p-4 grid grid-cols-2 sm:grid-cols-3 gap-3">
          <div>
            <label className="label">Type</label>
            <select className="input-field text-xs" value={filters.type || ''}
              onChange={e => setFilters(f => ({ ...f, type: e.target.value || undefined, offset: 0 }))}>
              <option value="" style={{ background: 'var(--bg-card)' }}>All Types</option>
              <option value="income" style={{ background: 'var(--bg-card)' }}>Income</option>
              <option value="expense" style={{ background: 'var(--bg-card)' }}>Expense</option>
            </select>
          </div>
          <div>
            <label className="label">Category</label>
            <select className="input-field text-xs" value={filters.category || ''}
              onChange={e => setFilters(f => ({ ...f, category: e.target.value || undefined, offset: 0 }))}>
              <option value="" style={{ background: 'var(--bg-card)' }}>All Categories</option>
              {[...INCOME_CATEGORIES, ...EXPENSE_CATEGORIES].map(c => (
                <option key={c} value={c} style={{ background: 'var(--bg-card)' }}>
                  {CATEGORY_CONFIG[c]?.label}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="label">From</label>
            <input type="date" className="input-field text-xs"
              value={filters.from || ''} onChange={e => setFilters(f => ({ ...f, from: e.target.value || undefined }))} />
          </div>
        </div>
      )}

      {/* Transactions list */}
      <div className="card overflow-hidden">
        {loading ? (
          <div className="p-4 flex flex-col gap-3">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="flex items-center gap-3">
                <div className="skeleton w-10 h-10 rounded-xl" />
                <div className="flex-1"><div className="skeleton h-3.5 w-36 mb-2" /><div className="skeleton h-3 w-24" /></div>
                <div className="skeleton h-4 w-20" />
              </div>
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <div className="p-12 text-center">
            <p className="text-3xl mb-3">📊</p>
            <p className="font-medium mb-1" style={{ color: 'var(--text-secondary)' }}>No transactions found</p>
            <p className="text-sm" style={{ color: 'var(--text-muted)' }}>Try adjusting your filters or add a new transaction</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b" style={{ borderColor: 'var(--border)' }}>
                  {['Transaction', 'Category', 'Date', 'Amount', ''].map(h => (
                    <th key={h} className="text-left px-4 py-3 text-xs font-semibold" style={{ color: 'var(--text-muted)' }}>
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filtered.map((t, i) => {
                  const cfg = CATEGORY_CONFIG[t.category];
                  return (
                    <tr key={t.id} className="border-b transition-colors duration-100 group"
                      style={{ borderColor: 'var(--border)', background: i % 2 === 0 ? 'transparent' : 'rgba(255,255,255,0.01)' }}
                      onMouseEnter={e => (e.currentTarget as HTMLElement).style.background = 'rgba(201,168,76,0.03)'}
                      onMouseLeave={e => (e.currentTarget as HTMLElement).style.background = i % 2 === 0 ? 'transparent' : 'rgba(255,255,255,0.01)'}>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-xl flex items-center justify-center text-sm flex-shrink-0"
                            style={{ background: cfg?.bgColor || 'rgba(148,163,184,0.12)' }}>
                            {cfg?.icon || '📦'}
                          </div>
                          <div>
                            <p className="text-sm font-medium" style={{ color: 'var(--text-primary)' }}>{t.description}</p>
                            {t.merchant && <p className="text-xs" style={{ color: 'var(--text-muted)' }}>{t.merchant}</p>}
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <span className="badge" style={{ background: cfg?.bgColor, color: cfg?.color }}>
                          {cfg?.label}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-xs" style={{ color: 'var(--text-muted)' }}>
                        {formatDate(t.date)}
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-1">
                          {t.type === 'income'
                            ? <ArrowDownLeft size={12} style={{ color: 'var(--success)' }} />
                            : <ArrowUpRight size={12} style={{ color: 'var(--danger)' }} />}
                          <span className="text-sm font-semibold"
                            style={{ color: t.type === 'income' ? 'var(--success)' : 'var(--danger)' }}>
                            {t.type === 'income' ? '+' : '-'}{formatCurrency(t.amount, currencySymbol)}
                          </span>
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <button onClick={() => deleteTransaction(t.id)}
                          className="opacity-0 group-hover:opacity-100 p-1.5 rounded-lg transition-all duration-200"
                          style={{ color: 'var(--danger)' }}
                          onMouseEnter={e => (e.currentTarget as HTMLElement).style.background = 'rgba(248,113,113,0.1)'}
                          onMouseLeave={e => (e.currentTarget as HTMLElement).style.background = 'transparent'}>
                          <Trash2 size={14} />
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {showModal && (
        <AddTransactionModal
          onClose={() => setShowModal(false)}
          onAdd={addTransaction}
          currencySymbol={currencySymbol}
          currency={currency}
        />
      )}
    </div>
  );
}
