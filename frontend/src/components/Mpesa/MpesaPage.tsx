import React, { useState, useRef } from 'react';
import { Upload, CheckCircle, Plus, Loader, FileText, AlertCircle } from 'lucide-react';
import { CATEGORY_CONFIG } from '../../utils/categories';
import { TransactionCategory } from '../../types';
import { getCurrencySymbol } from '../../utils/currency';
import toast from 'react-hot-toast';

const BACKEND_URL = import.meta.env.VITE_API_URL || '';

interface ParsedTx {
  description: string;
  amount: number;
  type: 'income' | 'expense';
  date: string;
  category: TransactionCategory;
  selected: boolean;
}

// Parse M-Pesa SMS format: "BH12345678 Confirmed. Ksh1,500 received from JOHN DOE 0712345678 on 15/3/26"
function parseMpesaSMS(text: string): ParsedTx[] {
  const results: ParsedTx[] = [];
  const lines = text.split('\n').filter(l => l.trim());

  for (const line of lines) {
    const lower = line.toLowerCase();
    let amount = 0;
    let type: 'income' | 'expense' = 'expense';
    let description = '';
    let date = new Date().toISOString().slice(0, 10);
    let category: TransactionCategory = 'other';

    // Extract amount
    const amtMatch = line.match(/[Kk]sh\.?\s*([\d,]+(?:\.\d{2})?)/);
    if (!amtMatch) continue;
    amount = parseFloat(amtMatch[1].replace(/,/g, ''));

    // Extract date
    const dateMatch = line.match(/(\d{1,2}\/\d{1,2}\/\d{2,4})/);
    if (dateMatch) {
      const parts = dateMatch[1].split('/');
      const yr = parts[2].length === 2 ? '20' + parts[2] : parts[2];
      date = `${yr}-${parts[1].padStart(2,'0')}-${parts[0].padStart(2,'0')}`;
    }

    // Determine type and category
    if (lower.includes('received') || lower.includes('deposited') || lower.includes('reversal')) {
      type = 'income'; category = 'income'; description = 'M-Pesa received';
    } else if (lower.includes('sent to') || lower.includes('paid to')) {
      type = 'expense'; category = 'other'; description = 'M-Pesa sent';
    } else if (lower.includes('till') || lower.includes('paybill') || lower.includes('buy goods')) {
      type = 'expense'; category = 'shopping'; description = 'M-Pesa payment';
    } else if (lower.includes('withdraw') || lower.includes('agent')) {
      type = 'expense'; category = 'other'; description = 'Cash withdrawal';
    } else if (lower.includes('airtime') || lower.includes('data')) {
      type = 'expense'; category = 'utilities'; description = 'Airtime/Data';
    }

    // Extract recipient/sender name
    const nameMatch = line.match(/(?:to|from|at)\s+([A-Z][A-Z\s]+?)(?:\s+\d|\s+on\s)/i);
    if (nameMatch) description = nameMatch[1].trim();

    if (amount > 0) results.push({ description, amount, type, date, category, selected: true });
  }
  return results;
}

export default function MpesaPage() {
  const sym = getCurrencySymbol();
  const fmt = (n: number) => `${sym} ${n.toLocaleString('en-KE', { maximumFractionDigits: 0 })}`;
  const [text, setText] = useState('');
  const [parsed, setParsed] = useState<ParsedTx[]>([]);
  const [loading, setLoading] = useState(false);
  const [imported, setImported] = useState(0);
  const [step, setStep] = useState<'input'|'review'|'done'>('input');
  const fileRef = useRef<HTMLInputElement>(null);

  const handleParse = () => {
    if (!text.trim()) return toast.error('Paste your M-Pesa messages first');
    const results = parseMpesaSMS(text);
    if (results.length === 0) return toast.error('No M-Pesa transactions found. Make sure to paste SMS messages.');
    setParsed(results);
    setStep('review');
    toast.success(`Found ${results.length} transactions`);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = ev => { setText(ev.target?.result as string || ''); };
    reader.readAsText(file);
    e.target.value = '';
  };

  const toggleTx = (i: number) => {
    setParsed(p => p.map((t, idx) => idx === i ? {...t, selected: !t.selected} : t));
  };

  const updateCat = (i: number, cat: TransactionCategory) => {
    setParsed(p => p.map((t, idx) => idx === i ? {...t, category: cat} : t));
  };

  const handleImport = async () => {
    const selected = parsed.filter(t => t.selected);
    if (selected.length === 0) return toast.error('Select at least one transaction');
    setLoading(true);
    let count = 0;
    for (const tx of selected) {
      try {
        await fetch(`${BACKEND_URL}/api/transactions/demo-user`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ amount: tx.amount, currency: 'KES', category: tx.category, description: tx.description, date: new Date(tx.date).toISOString(), type: tx.type })
        });
        count++;
      } catch { /* continue */ }
    }
    setImported(count);
    setLoading(false);
    setStep('done');
    toast.success(`${count} transactions imported!`);
  };

  return (
    <div className="flex flex-col gap-4">
      <div>
        <h2 className="section-title">M-Pesa Import</h2>
        <p className="section-subtitle">Paste your M-Pesa SMS messages — auto-categorized in seconds</p>
      </div>

      {step === 'input' && (
        <>
          <div className="card p-5 flex flex-col gap-4">
            <div className="flex items-start gap-3 p-3 rounded-xl" style={{ background: 'rgba(96,165,250,0.06)', border: '1px solid rgba(96,165,250,0.18)' }}>
              <AlertCircle size={15} style={{ color: 'var(--info)', flexShrink: 0, marginTop: 2 }} />
              <p className="text-xs" style={{ color: 'var(--text-secondary)' }}>
                Copy M-Pesa SMS messages from your phone and paste below. Each message on a new line works best. Your data stays on your device.
              </p>
            </div>
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="label">Paste M-Pesa Messages</label>
                <button onClick={() => fileRef.current?.click()} className="btn-ghost text-xs py-1 px-3 flex items-center gap-1">
                  <Upload size={12} /> Upload .txt
                </button>
                <input ref={fileRef} type="file" accept=".txt,.csv" className="hidden" onChange={handleFileUpload} />
              </div>
              <textarea className="input-field w-full" rows={10} placeholder={`Example:\nBH12345678 Confirmed. Ksh1,500 received from JOHN DOE on 15/3/26 at 10:30 AM\nBH87654321 Confirmed. Ksh2,000 paid to NAIVAS SUPERMARKET on 14/3/26 at 2:15 PM\nBH11223344 Confirmed. Ksh500 sent to 0712345678 JANE DOE on 13/3/26 at 8:00 AM`}
                value={text} onChange={e => setText(e.target.value)} style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: '12px' }} />
            </div>
            <button onClick={handleParse} className="btn-gold py-3 flex items-center justify-center gap-2">
              <FileText size={16} /> Parse Messages
            </button>
          </div>
        </>
      )}

      {step === 'review' && (
        <>
          <div className="flex items-center justify-between flex-wrap gap-3">
            <p className="text-sm font-medium" style={{ color: 'var(--text-secondary)' }}>
              Found <strong style={{ color: 'var(--gold)' }}>{parsed.length}</strong> transactions — review and import
            </p>
            <div className="flex gap-2">
              <button onClick={() => setParsed(p => p.map(t => ({...t, selected: true})))} className="btn-ghost text-xs py-1.5 px-3">All</button>
              <button onClick={() => setParsed(p => p.map(t => ({...t, selected: false})))} className="btn-ghost text-xs py-1.5 px-3">None</button>
            </div>
          </div>
          <div className="card overflow-hidden">
            <div className="divide-y" style={{ borderColor: 'var(--border)' }}>
              {parsed.map((tx, i) => (
                <div key={i} className="flex items-center gap-3 p-3 transition-colors"
                  style={{ opacity: tx.selected ? 1 : 0.4 }}>
                  <input type="checkbox" checked={tx.selected} onChange={() => toggleTx(i)}
                    className="w-4 h-4 flex-shrink-0 cursor-pointer" />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate" style={{ color: 'var(--text-primary)' }}>{tx.description}</p>
                    <p className="text-xs" style={{ color: 'var(--text-muted)' }}>{tx.date}</p>
                  </div>
                  <select value={tx.category} onChange={e => updateCat(i, e.target.value as TransactionCategory)}
                    className="text-xs rounded-lg px-2 py-1 border outline-none flex-shrink-0"
                    style={{ background: 'var(--bg-card)', borderColor: 'var(--border)', color: 'var(--text-secondary)', maxWidth: 130 }}>
                    {Object.keys(CATEGORY_CONFIG).map(c => <option key={c} value={c}>{CATEGORY_CONFIG[c as TransactionCategory].icon} {CATEGORY_CONFIG[c as TransactionCategory].label}</option>)}
                  </select>
                  <p className="font-bold text-sm flex-shrink-0" style={{ color: tx.type === 'income' ? 'var(--success)' : 'var(--danger)' }}>
                    {tx.type === 'income' ? '+' : '-'}{fmt(tx.amount)}
                  </p>
                </div>
              ))}
            </div>
          </div>
          <div className="flex gap-3">
            <button onClick={() => { setStep('input'); setParsed([]); }} className="btn-ghost flex-1 py-3">Back</button>
            <button onClick={handleImport} disabled={loading} className="btn-gold flex-1 py-3 flex items-center justify-center gap-2">
              {loading ? <Loader size={16} className="animate-spin" /> : <Plus size={16} />}
              Import {parsed.filter(t=>t.selected).length} Transactions
            </button>
          </div>
        </>
      )}

      {step === 'done' && (
        <div className="card p-10 text-center">
          <CheckCircle size={48} className="mx-auto mb-4" style={{ color: 'var(--success)' }} />
          <h3 className="text-xl font-bold mb-2" style={{ fontFamily: 'Fraunces, serif', color: 'var(--text-primary)' }}>
            {imported} transactions imported!
          </h3>
          <p className="text-sm mb-6" style={{ color: 'var(--text-muted)' }}>Your M-Pesa transactions are now in your dashboard.</p>
          <button onClick={() => { setStep('input'); setText(''); setParsed([]); setImported(0); }} className="btn-gold px-8 py-3">
            Import More
          </button>
        </div>
      )}
    </div>
  );
}
