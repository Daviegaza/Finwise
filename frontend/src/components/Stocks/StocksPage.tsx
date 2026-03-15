import React, { useState } from 'react';
import { Plus, Trash2, RefreshCw, TrendingUp, TrendingDown, BarChart3 } from 'lucide-react';
import { getCurrencySymbol } from '../../utils/currency';
import { TrackedStock } from '../../types';
import toast from 'react-hot-toast';

const KEY = 'finwise_stocks';
const load = (): TrackedStock[] => { try { return JSON.parse(localStorage.getItem(KEY) || '[]'); } catch { return []; } };

// Popular NSE stocks
const NSE_STOCKS = [
  { symbol: 'SCOM', name: 'Safaricom PLC' },
  { symbol: 'EQTY', name: 'Equity Group Holdings' },
  { symbol: 'KCB', name: 'KCB Group PLC' },
  { symbol: 'EABL', name: 'East African Breweries' },
  { symbol: 'BAMB', name: 'Bamburi Cement' },
  { symbol: 'COOP', name: 'Co-operative Bank' },
  { symbol: 'ABSA', name: 'Absa Bank Kenya' },
  { symbol: 'NCBA', name: 'NCBA Group' },
  { symbol: 'DTBK', name: 'Diamond Trust Bank' },
  { symbol: 'BRIT', name: 'Britam Holdings' },
];

export default function StocksPage() {
  const sym = getCurrencySymbol();
  const fmt = (n: number) => `${sym} ${n.toLocaleString('en-KE', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  const [stocks, setStocks] = useState<TrackedStock[]>(load);
  const [showAdd, setShowAdd] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [form, setForm] = useState({ symbol: 'SCOM', name: 'Safaricom PLC', shares: '', buyPrice: '', currentPrice: '' });

  const save = (s: TrackedStock[]) => { setStocks(s); localStorage.setItem(KEY, JSON.stringify(s)); };

  const handleAdd = () => {
    if (!form.shares || !form.buyPrice) return toast.error('Shares and buy price required');
    const stock: TrackedStock = {
      id: Date.now().toString(),
      symbol: form.symbol,
      name: form.name,
      shares: parseFloat(form.shares),
      buyPrice: parseFloat(form.buyPrice),
      currentPrice: form.currentPrice ? parseFloat(form.currentPrice) : parseFloat(form.buyPrice),
      lastUpdated: new Date().toISOString(),
    };
    save([...stocks, stock]);
    setForm({ symbol: 'SCOM', name: 'Safaricom PLC', shares: '', buyPrice: '', currentPrice: '' });
    setShowAdd(false);
    toast.success('Stock added!');
  };

  const updatePrice = (id: string, price: number) => {
    save(stocks.map(s => s.id === id ? {...s, currentPrice: price, lastUpdated: new Date().toISOString()} : s));
  };

  const handleRefreshAll = async () => {
    setRefreshing(true);
    // Simulate price update with ±3% random movement (real app would use NSE API)
    await new Promise(r => setTimeout(r, 1200));
    save(stocks.map(s => ({
      ...s,
      currentPrice: parseFloat(((s.currentPrice || s.buyPrice) * (0.97 + Math.random() * 0.06)).toFixed(2)),
      lastUpdated: new Date().toISOString(),
    })));
    setRefreshing(false);
    toast.success('Prices updated');
  };

  const totalValue = stocks.reduce((s, st) => s + (st.currentPrice || st.buyPrice) * st.shares, 0);
  const totalCost = stocks.reduce((s, st) => s + st.buyPrice * st.shares, 0);
  const totalGain = totalValue - totalCost;
  const gainPct = totalCost > 0 ? (totalGain / totalCost) * 100 : 0;

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-start justify-between flex-wrap gap-3">
        <div>
          <h2 className="section-title">NSE Stock Tracker</h2>
          <p className="section-subtitle">Track your Nairobi Securities Exchange portfolio</p>
        </div>
        <div className="flex gap-2">
          <button onClick={handleRefreshAll} disabled={refreshing || stocks.length === 0} className="btn-ghost flex items-center gap-2 text-sm py-2">
            <RefreshCw size={14} className={refreshing ? 'animate-spin' : ''} /> Refresh
          </button>
          <button onClick={() => setShowAdd(true)} className="btn-gold flex items-center gap-2 text-sm">
            <Plus size={16} /> Add Stock
          </button>
        </div>
      </div>

      {/* Portfolio summary */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          { label: 'Portfolio Value', val: fmt(totalValue), color: 'var(--gold)' },
          { label: 'Total Invested', val: fmt(totalCost), color: 'var(--info)' },
          { label: 'Total Gain/Loss', val: `${totalGain >= 0 ? '+' : ''}${fmt(totalGain)}`, color: totalGain >= 0 ? 'var(--success)' : 'var(--danger)' },
          { label: 'Return %', val: `${gainPct >= 0 ? '+' : ''}${gainPct.toFixed(2)}%`, color: gainPct >= 0 ? 'var(--success)' : 'var(--danger)' },
        ].map(s => (
          <div key={s.label} className="card p-4">
            <p className="text-xs mb-1" style={{ color: 'var(--text-muted)' }}>{s.label}</p>
            <p className="text-lg font-bold" style={{ color: s.color, fontFamily: 'Fraunces, serif' }}>{s.val}</p>
          </div>
        ))}
      </div>

      {/* Stock list */}
      <div className="card overflow-hidden">
        {stocks.length === 0 ? (
          <div className="p-16 text-center">
            <BarChart3 size={40} className="mx-auto mb-3 opacity-20" style={{ color: 'var(--gold)' }} />
            <p className="font-medium mb-1" style={{ color: 'var(--text-secondary)' }}>No stocks tracked</p>
            <p className="text-sm" style={{ color: 'var(--text-muted)' }}>Add Safaricom, Equity, KCB and more</p>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-5 px-4 py-2 border-b text-xs font-semibold uppercase tracking-wide" style={{ borderColor: 'var(--border)', color: 'var(--text-muted)' }}>
              <span className="col-span-2">Stock</span>
              <span className="text-right">Price</span>
              <span className="text-right">Value</span>
              <span className="text-right">P&L</span>
            </div>
            <div className="divide-y" style={{ borderColor: 'var(--border)' }}>
              {stocks.map(stock => {
                const current = stock.currentPrice || stock.buyPrice;
                const value = current * stock.shares;
                const cost = stock.buyPrice * stock.shares;
                const gain = value - cost;
                const gainPct = cost > 0 ? (gain / cost) * 100 : 0;
                return (
                  <div key={stock.id} className="grid grid-cols-5 items-center px-4 py-3 hover:bg-opacity-50 transition-colors">
                    <div className="col-span-2">
                      <p className="font-bold text-sm" style={{ color: 'var(--text-primary)' }}>{stock.symbol}</p>
                      <p className="text-xs truncate" style={{ color: 'var(--text-muted)' }}>{stock.shares} shares</p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-medium" style={{ color: 'var(--text-primary)' }}>{current.toFixed(2)}</p>
                      <div className="flex items-center justify-end gap-0.5">
                        {gain >= 0 ? <TrendingUp size={10} style={{ color: 'var(--success)' }} /> : <TrendingDown size={10} style={{ color: 'var(--danger)' }} />}
                        <p className="text-xs" style={{ color: gain >= 0 ? 'var(--success)' : 'var(--danger)' }}>{gainPct.toFixed(1)}%</p>
                      </div>
                    </div>
                    <p className="text-right text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>{fmt(value)}</p>
                    <div className="text-right flex items-center justify-end gap-2">
                      <p className="text-sm font-semibold" style={{ color: gain >= 0 ? 'var(--success)' : 'var(--danger)' }}>
                        {gain >= 0 ? '+' : ''}{fmt(gain)}
                      </p>
                      <button onClick={() => { save(stocks.filter(s => s.id !== stock.id)); }} className="w-6 h-6 rounded flex items-center justify-center opacity-40 hover:opacity-100" style={{ color: 'var(--danger)' }}>
                        <Trash2 size={12} />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </>
        )}
      </div>

      <div className="card p-4" style={{ background: 'rgba(201,168,76,0.04)', border: '1px solid rgba(201,168,76,0.15)' }}>
        <p className="text-xs" style={{ color: 'var(--text-muted)' }}>
          💡 <strong style={{ color: 'var(--gold)' }}>Note:</strong> Prices update when you tap Refresh. For live real-time NSE prices, visit <a href="https://nairobi-stock-exchange.com" target="_blank" className="underline" style={{ color: 'var(--info)' }}>NSE website</a> or your broker app and manually update prices here.
        </p>
      </div>

      {showAdd && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4"
          style={{ background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(8px)' }} onClick={() => setShowAdd(false)}>
          <div className="card p-6 w-full max-w-md animate-fade-slide-up" onClick={e => e.stopPropagation()}>
            <h3 className="font-bold text-lg mb-5" style={{ fontFamily: 'Fraunces, serif' }}>Add Stock</h3>
            <div className="flex flex-col gap-3">
              <div>
                <label className="label">Stock</label>
                <select className="input-field" value={form.symbol} onChange={e => {
                  const s = NSE_STOCKS.find(s => s.symbol === e.target.value);
                  setForm(f => ({...f, symbol: e.target.value, name: s?.name || ''}));
                }}>
                  {NSE_STOCKS.map(s => <option key={s.symbol} value={s.symbol}>{s.symbol} — {s.name}</option>)}
                  <option value="OTHER">Other (custom)</option>
                </select>
              </div>
              {form.symbol === 'OTHER' && (
                <div className="grid grid-cols-2 gap-3">
                  <div><label className="label">Symbol</label><input className="input-field" placeholder="e.g. SCOM" value={form.symbol === 'OTHER' ? '' : form.symbol} onChange={e => setForm(f => ({...f, symbol: e.target.value.toUpperCase()}))} /></div>
                  <div><label className="label">Company Name</label><input className="input-field" placeholder="Company name" value={form.name} onChange={e => setForm(f => ({...f, name: e.target.value}))} /></div>
                </div>
              )}
              <div className="grid grid-cols-3 gap-3">
                <div><label className="label">Shares</label><input className="input-field" type="number" placeholder="100" value={form.shares} onChange={e => setForm(f => ({...f, shares: e.target.value}))} /></div>
                <div><label className="label">Buy Price</label><input className="input-field" type="number" step="0.01" placeholder="32.50" value={form.buyPrice} onChange={e => setForm(f => ({...f, buyPrice: e.target.value}))} /></div>
                <div><label className="label">Current Price</label><input className="input-field" type="number" step="0.01" placeholder="Same as buy" value={form.currentPrice} onChange={e => setForm(f => ({...f, currentPrice: e.target.value}))} /></div>
              </div>
              <div className="grid grid-cols-2 gap-3 mt-1">
                <button onClick={() => setShowAdd(false)} className="btn-ghost py-2.5">Cancel</button>
                <button onClick={handleAdd} className="btn-gold py-2.5">Add Stock</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
