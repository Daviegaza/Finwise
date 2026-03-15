import React, { useState, useEffect } from 'react';
import { Globe, DollarSign, User, Bell, Save, Monitor } from 'lucide-react';
import { useUser } from '../../hooks';
import { aiApi } from '../../services/api';
import { Country } from '../../types';
import { CURRENCIES } from '../../utils/categories';

interface SettingsPageProps {
  onCurrencyChange: (currency: string, symbol: string) => void;
}

interface NotificationPrefs {
  budgetAlerts: boolean;
  weeklySummary: boolean;
  aiInsights: boolean;
}

export default function SettingsPage({ onCurrencyChange }: SettingsPageProps) {
  const { user, loading, updateUser } = useUser();
  const [countries, setCountries] = useState<Country[]>([]);
  const [form, setForm] = useState({
    name: '', email: '', country: 'US', currency: 'USD', monthlyIncome: '',
  });
  const [notifications, setNotifications] = useState<NotificationPrefs>({
    budgetAlerts: true, weeklySummary: true, aiInsights: true,
  });
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    aiApi.countries().then(setCountries).catch(console.error);
  }, []);

  useEffect(() => {
    if (user) {
      setForm({
        name: user.name, email: user.email,
        country: user.country, currency: user.currency,
        monthlyIncome: user.monthlyIncome.toString(),
      });
    }
  }, [user]);

  const handleCountryChange = (code: string) => {
    const country = countries.find(c => c.code === code);
    setForm(f => ({ ...f, country: code, currency: country?.currency || f.currency }));
  };

  const handleCurrencyChange = (currency: string) => {
    setForm(f => ({ ...f, currency }));
    onCurrencyChange(currency, CURRENCIES[currency]?.symbol || currency);
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      await updateUser({ ...form, monthlyIncome: parseFloat(form.monthlyIncome) || 0 });
      onCurrencyChange(form.currency, CURRENCIES[form.currency]?.symbol || form.currency);
      setSaved(true);
      setTimeout(() => setSaved(false), 2500);
    } finally { setSaving(false); }
  };

  const toggleNotif = (key: keyof NotificationPrefs) =>
    setNotifications(p => ({ ...p, [key]: !p[key] }));

  const selectedCountry = countries.find(c => c.code === form.country);

  const notifRows: { key: keyof NotificationPrefs; label: string; desc: string }[] = [
    { key: 'budgetAlerts', label: 'Budget Alerts', desc: 'Notify when 80% of budget is used' },
    { key: 'weeklySummary', label: 'Weekly Summary', desc: 'Get a weekly financial digest' },
    { key: 'aiInsights', label: 'AI Insights', desc: 'Auto-generate financial insights' },
  ];

  return (
    <div className="flex flex-col gap-4 max-w-2xl">
      <div>
        <h2 className="section-title">Settings</h2>
        <p className="section-subtitle">Manage your profile and preferences</p>
      </div>

      {loading ? (
        <div className="card p-5"><div className="skeleton h-4 w-32 mb-4" /><div className="skeleton h-10 w-full mb-3" /><div className="skeleton h-10 w-full" /></div>
      ) : (
        <>
          {/* Profile */}
          <div className="card overflow-hidden">
            <div className="flex items-center gap-3 px-5 py-4 border-b" style={{ borderColor: 'var(--border)' }}>
              <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: 'rgba(201,168,76,0.12)' }}>
                <User size={15} style={{ color: 'var(--gold)' }} />
              </div>
              <h3 className="font-semibold text-sm" style={{ color: 'var(--text-primary)' }}>Profile</h3>
            </div>
            <div className="p-5 flex flex-col gap-4">
              <div className="grid sm:grid-cols-2 gap-4">
                <div>
                  <label className="label">Full Name</label>
                  <input className="input-field" placeholder="Your name"
                    value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} />
                </div>
                <div>
                  <label className="label">Email</label>
                  <input className="input-field" type="email" placeholder="you@example.com"
                    value={form.email} onChange={e => setForm(f => ({ ...f, email: e.target.value }))} />
                </div>
              </div>
              <div>
                <label className="label">Monthly Income</label>
                <input className="input-field" type="number" step="0.01" placeholder="0.00"
                  value={form.monthlyIncome} onChange={e => setForm(f => ({ ...f, monthlyIncome: e.target.value }))} />
              </div>
            </div>
          </div>

          {/* Region & Currency */}
          <div className="card overflow-hidden">
            <div className="flex items-center gap-3 px-5 py-4 border-b" style={{ borderColor: 'var(--border)' }}>
              <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: 'rgba(96,165,250,0.12)' }}>
                <Globe size={15} style={{ color: 'var(--info)' }} />
              </div>
              <h3 className="font-semibold text-sm" style={{ color: 'var(--text-primary)' }}>Region & Currency</h3>
            </div>
            <div className="p-5 flex flex-col gap-4">
              <div>
                <label className="label">Country</label>
                <select className="input-field" value={form.country} onChange={e => handleCountryChange(e.target.value)}>
                  {countries.map(c => (
                    <option key={c.code} value={c.code} style={{ background: 'var(--bg-card)' }}>{c.name}</option>
                  ))}
                </select>
                {selectedCountry && (
                  <p className="text-xs mt-1.5" style={{ color: 'var(--text-muted)' }}>
                    Avg savings: {((selectedCountry.avgSavingsRate || 0) * 100).toFixed(0)}% ·
                    Tax rate: {((selectedCountry.taxRate || 0) * 100).toFixed(0)}%
                  </p>
                )}
              </div>
              <div>
                <label className="label">Currency</label>
                <select className="input-field" value={form.currency} onChange={e => handleCurrencyChange(e.target.value)}>
                  {Object.entries(CURRENCIES).map(([code, { name, symbol }]) => (
                    <option key={code} value={code} style={{ background: 'var(--bg-card)' }}>
                      {symbol} {code} — {name}
                    </option>
                  ))}
                </select>
              </div>
              <div className="p-3 rounded-xl flex items-center gap-3"
                style={{ background: 'rgba(96,165,250,0.07)', border: '1px solid rgba(96,165,250,0.18)' }}>
                <DollarSign size={15} style={{ color: 'var(--info)', flexShrink: 0 }} />
                <p className="text-xs" style={{ color: 'var(--text-secondary)' }}>
                  Currency changes apply to all displayed values. Rates are approximate.
                </p>
              </div>
            </div>
          </div>

          {/* Notifications */}
          <div className="card overflow-hidden">
            <div className="flex items-center gap-3 px-5 py-4 border-b" style={{ borderColor: 'var(--border)' }}>
              <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: 'rgba(167,139,250,0.12)' }}>
                <Bell size={15} style={{ color: 'var(--purple)' }} />
              </div>
              <h3 className="font-semibold text-sm" style={{ color: 'var(--text-primary)' }}>Notifications</h3>
            </div>
            <div className="p-5 flex flex-col gap-1">
              {notifRows.map(({ key, label, desc }) => (
                <div key={key} className="flex items-center justify-between gap-4 py-3 border-b last:border-0"
                  style={{ borderColor: 'var(--border)' }}>
                  <div>
                    <p className="text-sm font-medium mb-0.5" style={{ color: 'var(--text-primary)' }}>{label}</p>
                    <p className="text-xs" style={{ color: 'var(--text-muted)' }}>{desc}</p>
                  </div>
                  <button onClick={() => toggleNotif(key)}
                    className="relative flex-shrink-0 w-11 h-6 rounded-full transition-all duration-300"
                    style={{ background: notifications[key] ? 'var(--gold)' : 'rgba(255,255,255,0.1)' }}>
                    <div className="absolute top-0.5 w-5 h-5 rounded-full bg-white transition-all duration-300"
                      style={{ left: notifications[key] ? '22px' : '2px' }} />
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* App Info */}
          <div className="card overflow-hidden">
            <div className="flex items-center gap-3 px-5 py-4 border-b" style={{ borderColor: 'var(--border)' }}>
              <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: 'rgba(52,211,153,0.12)' }}>
                <Monitor size={15} style={{ color: 'var(--success)' }} />
              </div>
              <h3 className="font-semibold text-sm" style={{ color: 'var(--text-primary)' }}>App Info</h3>
            </div>
            <div className="p-5">
              <div className="grid grid-cols-2 gap-px overflow-hidden rounded-xl" style={{ background: 'var(--border)' }}>
                {[
                  ['Version', '2.0.0 — Global Edition'],
                  ['AI Model', 'Claude Opus (Anthropic)'],
                  ['Countries', `${countries.length || 15}+ supported`],
                  ['Storage', 'Session-based (demo)'],
                ].map(([label, value]) => (
                  <div key={label} className="p-3" style={{ background: 'var(--bg-card)' }}>
                    <p className="text-xs mb-1" style={{ color: 'var(--text-muted)' }}>{label}</p>
                    <p className="text-xs font-semibold" style={{ color: 'var(--text-secondary)' }}>{value}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <button onClick={handleSave} disabled={saving}
            className="btn-gold py-3.5 flex items-center justify-center gap-2">
            {saving ? (
              <div className="w-4 h-4 border-2 rounded-full animate-spin"
                style={{ borderColor: '#1A1000', borderTopColor: 'transparent' }} />
            ) : saved ? <><span>✓</span> Saved!</> : <><Save size={16} /> Save Changes</>}
          </button>
        </>
      )}
    </div>
  );
}
