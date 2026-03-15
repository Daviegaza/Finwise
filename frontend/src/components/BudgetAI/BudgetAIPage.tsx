import React, { useState } from 'react';
import { Sparkles, Loader, CheckCircle, RefreshCw, AlertCircle } from 'lucide-react';
import { getCurrencySymbol } from '../../utils/currency';
import { CATEGORY_CONFIG } from '../../utils/categories';
import { TransactionCategory } from '../../types';
import toast from 'react-hot-toast';

const BASE = import.meta.env.VITE_API_URL || '';

interface BudgetPlan {
  categories: { category: TransactionCategory; limit: number; reason: string }[];
  savingsTarget: number; tips: string[]; summary: string;
}

const LIFESTYLES = ['Frugal','Moderate','Comfortable','Lavish'];
const PRIORITIES = ['Building emergency fund','Paying off debt','Saving to invest','Buying property','Growing income','Work-life balance'];
const DEPENDANTS = ['None','1 child','2 children','3+ children','Elderly parent','Multiple dependants'];

export default function BudgetAIPage() {
  const sym = getCurrencySymbol();
  const fmt = (n: number) => `${sym} ${n.toLocaleString('en-KE', { maximumFractionDigits: 0 })}`;
  const [step, setStep] = useState<'form'|'loading'|'result'>('form');
  const [plan, setPlan] = useState<BudgetPlan | null>(null);
  const [error, setError] = useState('');
  const [form, setForm] = useState({ income:'', lifestyle:'Moderate', priority:'Building emergency fund', dependants:'None', location:'Nairobi', hasDebt:false, savingsGoal:'20' });

  const generate = async () => {
    if (!form.income || parseFloat(form.income) <= 0) return toast.error('Enter your monthly income');
    setStep('loading'); setError('');
    try {
      const res = await fetch(`${BASE}/api/ai/generate-budget`, {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...form, currencySymbol: sym }),
      });
      if (!res.ok) throw new Error(`Server error ${res.status}`);
      const data = await res.json();
      if (data.error) throw new Error(data.error);
      setPlan(data); setStep('result');
    } catch (e: any) {
      setError(e.message || 'Failed to generate. Is your backend running?');
      setStep('form');
      toast.error('Budget generation failed');
    }
  };

  const applyBudgets = async () => {
    if (!plan) return;
    let count = 0;
    for (const cat of plan.categories) {
      try {
        await fetch(`${BASE}/api/budgets/demo-user`, {
          method: 'POST', headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ category: cat.category, limit: cat.limit, currency: 'USD', period: 'monthly', color: CATEGORY_CONFIG[cat.category]?.color || '#C9A84C' }),
        });
        count++;
      } catch { /* continue */ }
    }
    toast.success(`${count} budgets applied!`);
  };

  return (
    <div className="flex flex-col gap-4">
      <div>
        <h2 className="section-title flex items-center gap-2">
          <Sparkles size={20} style={{ color: 'var(--gold)' }} /> AI Budget Generator
        </h2>
        <p className="section-subtitle">Answer a few questions — Claude builds your personalized budget</p>
      </div>

      {step === 'form' && (
        <div className="card p-6 max-w-xl flex flex-col gap-4">
          {error && (
            <div className="p-3 rounded-xl flex items-center gap-3" style={{ background: 'rgba(248,113,113,0.08)', border: '1px solid rgba(248,113,113,0.25)' }}>
              <AlertCircle size={14} style={{ color: 'var(--danger)', flexShrink: 0 }} />
              <p className="text-xs" style={{ color: 'var(--danger)' }}>{error}</p>
            </div>
          )}
          <div className="grid sm:grid-cols-2 gap-4">
            <div><label className="label">Monthly Income ({sym})</label><input className="input-field" type="number" placeholder="e.g. 80000" value={form.income} onChange={e => setForm(f => ({...f, income: e.target.value}))} /></div>
            <div><label className="label">City / Location</label><input className="input-field" placeholder="e.g. Nairobi" value={form.location} onChange={e => setForm(f => ({...f, location: e.target.value}))} /></div>
          </div>
          <div>
            <label className="label">Lifestyle</label>
            <div className="grid grid-cols-4 gap-2">
              {LIFESTYLES.map(l => (
                <button key={l} onClick={() => setForm(f => ({...f, lifestyle: l}))}
                  className="py-2 rounded-xl text-sm font-medium transition-all"
                  style={{ background: form.lifestyle===l ? 'rgba(201,168,76,0.15)' : 'rgba(255,255,255,0.04)', color: form.lifestyle===l ? 'var(--gold)' : 'var(--text-muted)', border: `1px solid ${form.lifestyle===l ? 'rgba(201,168,76,0.3)' : 'transparent'}` }}>
                  {l}
                </button>
              ))}
            </div>
          </div>
          <div>
            <label className="label">Main Financial Priority</label>
            <div className="grid grid-cols-2 gap-2">
              {PRIORITIES.map(p => (
                <button key={p} onClick={() => setForm(f => ({...f, priority: p}))}
                  className="py-2 px-3 rounded-xl text-left text-xs font-medium transition-all"
                  style={{ background: form.priority===p ? 'rgba(201,168,76,0.12)' : 'rgba(255,255,255,0.03)', color: form.priority===p ? 'var(--gold)' : 'var(--text-muted)', border: `1px solid ${form.priority===p ? 'rgba(201,168,76,0.25)' : 'transparent'}` }}>
                  {p}
                </button>
              ))}
            </div>
          </div>
          <div className="grid sm:grid-cols-2 gap-4">
            <div><label className="label">Dependants</label>
              <select className="input-field" value={form.dependants} onChange={e => setForm(f => ({...f, dependants: e.target.value}))}>
                {DEPENDANTS.map(d => <option key={d}>{d}</option>)}
              </select>
            </div>
            <div><label className="label">Savings Target %</label>
              <input className="input-field" type="number" min="5" max="60" value={form.savingsGoal} onChange={e => setForm(f => ({...f, savingsGoal: e.target.value}))} />
            </div>
          </div>
          <div className="flex items-center gap-3">
            <button onClick={() => setForm(f => ({...f, hasDebt: !f.hasDebt}))}
              className="relative w-11 h-6 rounded-full transition-all flex-shrink-0"
              style={{ background: form.hasDebt ? 'var(--gold)' : 'rgba(255,255,255,0.1)' }}>
              <div className="absolute top-0.5 w-5 h-5 rounded-full bg-white transition-all" style={{ left: form.hasDebt ? '22px' : '2px' }} />
            </button>
            <label className="text-sm" style={{ color: 'var(--text-secondary)' }}>I have existing loans or debt</label>
          </div>
          <button onClick={generate} className="btn-gold py-3.5 flex items-center justify-center gap-2">
            <Sparkles size={16} /> Generate My Budget
          </button>
        </div>
      )}

      {step === 'loading' && (
        <div className="card p-16 text-center">
          <Loader size={32} className="animate-spin mx-auto mb-4" style={{ color: 'var(--gold)' }} />
          <p className="font-semibold mb-1" style={{ color: 'var(--text-primary)' }}>Building your budget...</p>
          <p className="text-sm" style={{ color: 'var(--text-muted)' }}>Analyzing your income, location and goals</p>
        </div>
      )}

      {step === 'result' && plan && (
        <div className="flex flex-col gap-4">
          <div className="card p-5" style={{ background: 'rgba(201,168,76,0.05)', borderColor: 'rgba(201,168,76,0.2)' }}>
            <div className="flex items-center gap-2 mb-3"><Sparkles size={15} style={{ color: 'var(--gold)' }} /><h3 className="font-semibold text-sm gold-text">AI Analysis</h3></div>
            <p className="text-sm leading-relaxed" style={{ color: 'var(--text-secondary)' }}>{plan.summary}</p>
          </div>
          <div className="card overflow-hidden">
            <div className="px-5 py-4 border-b" style={{ borderColor: 'var(--border)' }}>
              <h3 className="font-semibold text-sm" style={{ color: 'var(--text-primary)' }}>Your Personalized Budget</h3>
            </div>
            <div className="divide-y" style={{ borderColor: 'var(--border)' }}>
              {plan.categories.map(cat => {
                const meta = CATEGORY_CONFIG[cat.category];
                const pct = (cat.limit / (parseFloat(form.income)||1)) * 100;
                return (
                  <div key={cat.category} className="p-4 flex items-start gap-3">
                    <div className="w-9 h-9 rounded-xl flex items-center justify-center text-lg flex-shrink-0" style={{ background: `${meta?.color||'#94A3B8'}18` }}>{meta?.icon||'📦'}</div>
                    <div className="flex-1">
                      <div className="flex justify-between mb-1">
                        <p className="font-medium text-sm" style={{ color: 'var(--text-primary)' }}>{meta?.label||cat.category}</p>
                        <p className="font-bold text-sm" style={{ color: 'var(--gold)' }}>{fmt(cat.limit)}</p>
                      </div>
                      <div className="h-1.5 rounded-full mb-1" style={{ background: 'rgba(255,255,255,0.06)' }}>
                        <div className="h-full rounded-full" style={{ width: `${Math.min(pct,100)}%`, background: meta?.color||'#C9A84C' }} />
                      </div>
                      <p className="text-xs" style={{ color: 'var(--text-muted)' }}>{pct.toFixed(0)}% of income · {cat.reason}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
          <div className="card p-5">
            <h3 className="font-semibold text-sm mb-3" style={{ color: 'var(--text-primary)' }}>Personalized Tips</h3>
            <div className="flex flex-col gap-2">
              {plan.tips.map((tip, i) => (
                <div key={i} className="flex items-start gap-2">
                  <span className="text-sm flex-shrink-0" style={{ color: 'var(--gold)' }}>{i+1}.</span>
                  <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>{tip}</p>
                </div>
              ))}
            </div>
          </div>
          <div className="flex gap-3">
            <button onClick={() => { setStep('form'); setPlan(null); }} className="btn-ghost flex-1 py-3 flex items-center justify-center gap-2">
              <RefreshCw size={14} /> Regenerate
            </button>
            <button onClick={applyBudgets} className="btn-gold flex-1 py-3 flex items-center justify-center gap-2">
              <CheckCircle size={14} /> Apply to Budgets
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
