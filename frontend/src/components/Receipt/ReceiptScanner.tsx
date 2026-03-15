import React, { useState, useRef } from 'react';
import { Camera, Upload, Loader, CheckCircle, Plus, Trash2, Receipt } from 'lucide-react';
import { getCurrencySymbol } from '../../utils/currency';
import { CATEGORY_CONFIG } from '../../utils/categories';
import { TransactionCategory } from '../../types';
import toast from 'react-hot-toast';

const BASE = import.meta.env.VITE_API_URL || '';

interface ParsedReceipt {
  merchant: string; total: number; date: string;
  items: { name: string; amount: number }[];
  category: TransactionCategory; raw: string;
}
interface SavedReceipt extends ParsedReceipt {
  id: string; imagePreview: string; addedToTransactions: boolean; createdAt: string;
}

const loadReceipts = (): SavedReceipt[] => {
  try { return JSON.parse(localStorage.getItem('finwise_receipts') || '[]'); } catch { return []; }
};
const CATS = Object.keys(CATEGORY_CONFIG) as TransactionCategory[];

export default function ReceiptScanner() {
  const sym = getCurrencySymbol();
  const fmt = (n: number) => `${sym} ${Math.abs(n).toFixed(2)}`;
  const [receipts, setReceipts] = useState<SavedReceipt[]>(loadReceipts);
  const [scanning, setScanning] = useState(false);
  const [parsed, setParsed] = useState<ParsedReceipt | null>(null);
  const [preview, setPreview] = useState('');
  const [activeTab, setActiveTab] = useState<'scan'|'history'>('scan');
  const [error, setError] = useState('');
  const fileRef = useRef<HTMLInputElement>(null);
  const cameraRef = useRef<HTMLInputElement>(null);

  const save = (u: SavedReceipt[]) => { setReceipts(u); localStorage.setItem('finwise_receipts', JSON.stringify(u)); };

  const processImage = async (file: File) => {
    if (!file.type.startsWith('image/')) return toast.error('Please upload an image file');
    setScanning(true); setParsed(null); setError('');
    const reader = new FileReader();
    reader.onload = async (e) => {
      const dataUrl = e.target?.result as string;
      const base64 = dataUrl.split(',')[1];
      setPreview(dataUrl);
      try {
        const res = await fetch(`${BASE}/api/ai/scan-receipt`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ imageBase64: base64, mediaType: file.type }),
        });
        if (!res.ok) throw new Error(`Server error: ${res.status}`);
        const result = await res.json() as ParsedReceipt;
        setParsed(result);
        toast.success('Receipt scanned!');
      } catch (err: any) {
        const msg = err.message || 'Could not scan receipt';
        setError(msg);
        toast.error(msg);
      } finally { setScanning(false); }
    };
    reader.readAsDataURL(file);
  };

  const handleFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0]; if (f) processImage(f); e.target.value = '';
  };

  const addToTransactions = async () => {
    if (!parsed) return;
    try {
      const res = await fetch(`${BASE}/api/transactions/demo-user`, {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ amount: parsed.total, currency: 'USD', category: parsed.category, description: parsed.merchant || 'Receipt', date: new Date(parsed.date).toISOString(), type: 'expense' }),
      });
      if (!res.ok) throw new Error('Failed to save');
      save([{ ...parsed, id: Date.now().toString(), imagePreview: preview, addedToTransactions: true, createdAt: new Date().toISOString() }, ...receipts]);
      setParsed(null); setPreview('');
      toast.success(`${fmt(parsed.total)} added to transactions!`);
    } catch { toast.error('Failed to save. Is your backend running?'); }
  };

  return (
    <div className="flex flex-col gap-4">
      <div>
        <h2 className="section-title">Receipt Scanner</h2>
        <p className="section-subtitle">Photo your receipt — AI auto-fills your transaction</p>
      </div>

      <div className="flex gap-2 p-1 rounded-xl w-fit" style={{ background: 'rgba(255,255,255,0.04)' }}>
        {(['scan','history'] as const).map(t => (
          <button key={t} onClick={() => setActiveTab(t)}
            className="px-5 py-2 rounded-lg text-sm font-medium capitalize transition-all"
            style={{ background: activeTab===t ? 'rgba(201,168,76,0.15)' : 'none', color: activeTab===t ? 'var(--gold)' : 'var(--text-muted)', border: `1px solid ${activeTab===t ? 'rgba(201,168,76,0.3)' : 'transparent'}` }}>
            {t}
          </button>
        ))}
      </div>

      {activeTab === 'scan' && (
        <div className="flex flex-col gap-4">
          {!scanning && !parsed && (
            <div className="card p-8 flex flex-col items-center gap-4 text-center border-2 border-dashed cursor-pointer"
              style={{ borderColor: 'rgba(201,168,76,0.3)' }}
              onClick={() => fileRef.current?.click()}
              onDragOver={e => e.preventDefault()}
              onDrop={e => { e.preventDefault(); const f = e.dataTransfer.files[0]; if (f) processImage(f); }}>
              <div className="w-16 h-16 rounded-2xl flex items-center justify-center" style={{ background: 'rgba(201,168,76,0.1)' }}>
                <Receipt size={28} style={{ color: 'var(--gold)' }} />
              </div>
              <div>
                <p className="font-semibold mb-1" style={{ color: 'var(--text-primary)' }}>Drop receipt image here</p>
                <p className="text-sm" style={{ color: 'var(--text-muted)' }}>PNG, JPG, WEBP supported</p>
              </div>
              <div className="flex gap-3">
                <button onClick={e => { e.stopPropagation(); cameraRef.current?.click(); }} className="btn-gold flex items-center gap-2 text-sm px-4 py-2">
                  <Camera size={15} /> Take Photo
                </button>
                <button className="btn-ghost flex items-center gap-2 text-sm px-4 py-2">
                  <Upload size={15} /> Upload File
                </button>
              </div>
              <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handleFile} />
              <input ref={cameraRef} type="file" accept="image/*" capture="environment" className="hidden" onChange={handleFile} />
            </div>
          )}

          {scanning && (
            <div className="card p-10 flex flex-col items-center gap-4">
              {preview && <img src={preview} alt="Receipt" className="w-32 h-40 object-cover rounded-xl opacity-50" />}
              <div className="flex items-center gap-3">
                <Loader size={20} className="animate-spin" style={{ color: 'var(--gold)' }} />
                <p style={{ color: 'var(--text-secondary)' }}>AI is reading your receipt...</p>
              </div>
            </div>
          )}

          {error && !scanning && (
            <div className="card p-4 flex items-center gap-3" style={{ borderColor: 'rgba(248,113,113,0.3)', background: 'rgba(248,113,113,0.05)' }}>
              <p className="text-sm" style={{ color: 'var(--danger)' }}>{error}</p>
              <button onClick={() => { setError(''); setPreview(''); }} className="ml-auto btn-ghost text-xs py-1 px-3">Try Again</button>
            </div>
          )}

          {parsed && !scanning && (
            <div className="grid sm:grid-cols-2 gap-4">
              {preview && (
                <div className="card p-3">
                  <img src={preview} alt="Receipt" className="w-full rounded-xl object-cover" style={{ maxHeight: 280 }} />
                </div>
              )}
              <div className="card p-5 flex flex-col gap-3">
                <div className="flex items-center gap-2 mb-1">
                  <CheckCircle size={18} style={{ color: 'var(--success)' }} />
                  <p className="font-semibold text-sm" style={{ color: 'var(--success)' }}>Receipt Parsed!</p>
                </div>
                <div>
                  <label className="label">Merchant</label>
                  <input className="input-field" value={parsed.merchant} onChange={e => setParsed(p => p ? {...p, merchant: e.target.value} : p)} />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="label">Total ({sym})</label>
                    <input className="input-field" type="number" value={parsed.total} onChange={e => setParsed(p => p ? {...p, total: parseFloat(e.target.value)||0} : p)} />
                  </div>
                  <div>
                    <label className="label">Date</label>
                    <input className="input-field" type="date" value={parsed.date} onChange={e => setParsed(p => p ? {...p, date: e.target.value} : p)} />
                  </div>
                </div>
                <div>
                  <label className="label">Category</label>
                  <select className="input-field" value={parsed.category} onChange={e => setParsed(p => p ? {...p, category: e.target.value as TransactionCategory} : p)}>
                    {CATS.map(c => <option key={c} value={c}>{CATEGORY_CONFIG[c].icon} {CATEGORY_CONFIG[c].label}</option>)}
                  </select>
                </div>
                {parsed.items.length > 0 && (
                  <div>
                    <p className="text-xs font-semibold mb-2" style={{ color: 'var(--text-muted)' }}>ITEMS DETECTED</p>
                    <div className="max-h-28 overflow-y-auto flex flex-col gap-0.5">
                      {parsed.items.map((item, i) => (
                        <div key={i} className="flex justify-between text-xs py-1 border-b" style={{ borderColor: 'var(--border)' }}>
                          <span style={{ color: 'var(--text-secondary)' }}>{item.name}</span>
                          <span style={{ color: 'var(--text-primary)' }}>{fmt(item.amount)}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
                <div className="flex gap-3 mt-1">
                  <button onClick={() => { setParsed(null); setPreview(''); }} className="btn-ghost flex-1 py-2.5 text-sm">Retake</button>
                  <button onClick={addToTransactions} className="btn-gold flex-1 py-2.5 text-sm flex items-center justify-center gap-2">
                    <Plus size={14} /> Add Transaction
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {activeTab === 'history' && (
        <div className="card overflow-hidden">
          {receipts.length === 0 ? (
            <div className="p-16 text-center">
              <Receipt size={40} className="mx-auto mb-3 opacity-20" style={{ color: 'var(--gold)' }} />
              <p className="text-sm" style={{ color: 'var(--text-muted)' }}>No scanned receipts yet</p>
            </div>
          ) : (
            <div className="divide-y" style={{ borderColor: 'var(--border)' }}>
              {receipts.map(r => (
                <div key={r.id} className="flex items-center gap-3 p-4">
                  {r.imagePreview && <img src={r.imagePreview} alt="" className="w-12 h-14 object-cover rounded-lg flex-shrink-0" />}
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-sm truncate" style={{ color: 'var(--text-primary)' }}>{r.merchant}</p>
                    <p className="text-xs" style={{ color: 'var(--text-muted)' }}>{r.date} · {CATEGORY_CONFIG[r.category]?.label}</p>
                  </div>
                  <p className="font-bold text-sm flex-shrink-0" style={{ color: 'var(--danger)' }}>-{fmt(r.total)}</p>
                  <span className="text-xs px-2 py-1 rounded-full flex-shrink-0"
                    style={{ background: r.addedToTransactions ? 'rgba(52,211,153,0.12)' : 'rgba(255,255,255,0.06)', color: r.addedToTransactions ? 'var(--success)' : 'var(--text-muted)' }}>
                    {r.addedToTransactions ? '✓ Saved' : 'Pending'}
                  </span>
                  <button onClick={() => save(receipts.filter(x => x.id !== r.id))} className="w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0" style={{ color: 'var(--danger)' }}>
                    <Trash2 size={13} />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
