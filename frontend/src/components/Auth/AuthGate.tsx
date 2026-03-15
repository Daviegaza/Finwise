import React, { useState } from 'react';
import { TrendingUp } from 'lucide-react';

interface AuthGateProps {
  hasProfile: boolean;
  onCreateProfile: (name: string, email: string, pin: string) => void;
  onUnlock: (pin: string) => boolean;
}

type Screen = 'unlock' | 'create-1' | 'create-2';

export default function AuthGate({ hasProfile, onCreateProfile, onUnlock }: AuthGateProps) {
  const [screen, setScreen] = useState<Screen>(hasProfile ? 'unlock' : 'create-1');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [pin, setPin] = useState('');
  const [confirmPin, setConfirmPin] = useState('');
  const [pinError, setPinError] = useState('');
  const [unlockPin, setUnlockPin] = useState('');
  const [unlockError, setUnlockError] = useState('');
  const [attempts, setAttempts] = useState(0);

  const handleUnlock = () => {
    if (!unlockPin.trim()) return;
    if (!onUnlock(unlockPin)) {
      setAttempts(a => a + 1);
      setUnlockError(`Incorrect PIN${attempts >= 2 ? ' — check your profile PIN' : ''}`);
      setUnlockPin('');
    }
  };

  const handleCreate = () => {
    if (pin.length < 4) { setPinError('PIN must be at least 4 digits'); return; }
    if (pin !== confirmPin) { setPinError('PINs do not match'); return; }
    onCreateProfile(name.trim(), email.trim(), pin);
  };

  const pinStyle: React.CSSProperties = {
    width: '100%', background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(201,168,76,0.3)',
    borderRadius: 12, padding: '14px 16px', color: 'var(--text-primary)', fontSize: 24,
    fontFamily: 'Sora, sans-serif', letterSpacing: 8, textAlign: 'center', outline: 'none',
  };
  const inputStyle: React.CSSProperties = {
    width: '100%', background: 'rgba(255,255,255,0.04)', border: '1px solid var(--border)',
    borderRadius: 10, padding: '12px 14px', color: 'var(--text-primary)', fontSize: 14,
    fontFamily: 'Sora, sans-serif', outline: 'none',
  };
  const btnStyle: React.CSSProperties = {
    width: '100%', padding: 14, background: 'linear-gradient(135deg, #C9A84C, #E8C86D)',
    color: '#1A1000', borderRadius: 12, fontWeight: 700, fontSize: 15, fontFamily: 'Sora, sans-serif',
    border: 'none', cursor: 'pointer',
  };

  return (
    <div style={{ position: 'fixed', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--bg-primary)', padding: 24, zIndex: 1000 }}>
      <div style={{ background: 'var(--bg-secondary)', border: '1px solid rgba(201,168,76,0.2)', borderRadius: 20, padding: '40px 36px', width: '100%', maxWidth: 420 }}>
        {/* Logo */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 32 }}>
          <div style={{ width: 44, height: 44, borderRadius: 12, background: 'linear-gradient(135deg, #C9A84C, #E8C86D)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <TrendingUp size={22} style={{ color: '#1A1000' }} />
          </div>
          <div>
            <div style={{ fontFamily: 'Fraunces, serif', fontSize: 20, fontWeight: 700, color: 'var(--gold)' }}>FinWise</div>
            <div style={{ fontSize: 10, color: 'var(--text-muted)', letterSpacing: '0.12em' }}>YOUR MONEY, MASTERED</div>
          </div>
        </div>

        {screen === 'unlock' && (
          <>
            <div style={{ fontFamily: 'Fraunces, serif', fontSize: 26, fontWeight: 700, color: 'var(--text-primary)', marginBottom: 8 }}>Welcome Back</div>
            <p style={{ fontSize: 14, color: 'var(--text-secondary)', marginBottom: 24 }}>Enter your PIN to unlock FinWise</p>
            <input style={pinStyle} type="password" inputMode="numeric" placeholder="••••••"
              value={unlockPin} onChange={e => { setUnlockPin(e.target.value.replace(/\D/g,'').slice(0,6)); setUnlockError(''); }}
              onKeyDown={e => e.key === 'Enter' && handleUnlock()} autoFocus maxLength={6} />
            {unlockError && <div style={{ fontSize: 13, color: 'var(--danger)', background: 'rgba(248,113,113,0.08)', padding: '10px 14px', borderRadius: 8, marginTop: 10, marginBottom: 10 }}>{unlockError}</div>}
            <button style={{ ...btnStyle, marginTop: 16, opacity: !unlockPin ? 0.5 : 1 }} onClick={handleUnlock} disabled={!unlockPin}>Unlock →</button>
            <p style={{ fontSize: 12, color: 'var(--text-muted)', textAlign: 'center', marginTop: 16 }}>
              Forgot PIN?{' '}
              <button style={{ background: 'none', border: 'none', color: 'var(--gold)', fontSize: 12, fontFamily: 'Sora, sans-serif', cursor: 'pointer', textDecoration: 'underline' }}
                onClick={() => { if (window.confirm('This will delete all local data. Continue?')) { localStorage.clear(); window.location.reload(); } }}>
                Reset everything
              </button>
            </p>
          </>
        )}

        {screen === 'create-1' && (
          <>
            <div style={{ fontFamily: 'Fraunces, serif', fontSize: 26, fontWeight: 700, color: 'var(--text-primary)', marginBottom: 8 }}>Create Profile</div>
            <p style={{ fontSize: 14, color: 'var(--text-secondary)', marginBottom: 24 }}>Set up your private FinWise account — all data stays on this device</p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 14, marginBottom: 24 }}>
              <div><label style={{ fontSize: 11, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.07em', display: 'block', marginBottom: 6 }}>Your Name</label>
                <input style={inputStyle} placeholder="e.g. David" value={name} onChange={e => setName(e.target.value)} /></div>
              <div><label style={{ fontSize: 11, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.07em', display: 'block', marginBottom: 6 }}>Email</label>
                <input style={inputStyle} type="email" placeholder="you@example.com" value={email} onChange={e => setEmail(e.target.value)} /></div>
            </div>
            <button style={{ ...btnStyle, opacity: !name.trim() || !email.trim() ? 0.5 : 1 }}
              onClick={() => { if (name.trim() && email.trim()) setScreen('create-2'); }} disabled={!name.trim() || !email.trim()}>
              Continue →
            </button>
            <p style={{ fontSize: 12, color: 'var(--text-muted)', textAlign: 'center', marginTop: 14 }}>🔒 Your data never leaves this device</p>
          </>
        )}

        {screen === 'create-2' && (
          <>
            <div style={{ fontFamily: 'Fraunces, serif', fontSize: 26, fontWeight: 700, color: 'var(--text-primary)', marginBottom: 8 }}>Set Your PIN</div>
            <p style={{ fontSize: 14, color: 'var(--text-secondary)', marginBottom: 24 }}>Choose a 4–6 digit PIN to protect your financial data</p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 14, marginBottom: 20 }}>
              <div><label style={{ fontSize: 11, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.07em', display: 'block', marginBottom: 6 }}>Create PIN (4–6 digits)</label>
                <input style={pinStyle} type="password" inputMode="numeric" placeholder="••••" value={pin}
                  onChange={e => { setPin(e.target.value.replace(/\D/g,'').slice(0,6)); setPinError(''); }} maxLength={6} autoFocus /></div>
              <div><label style={{ fontSize: 11, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.07em', display: 'block', marginBottom: 6 }}>Confirm PIN</label>
                <input style={pinStyle} type="password" inputMode="numeric" placeholder="••••" value={confirmPin}
                  onChange={e => { setConfirmPin(e.target.value.replace(/\D/g,'').slice(0,6)); setPinError(''); }} maxLength={6}
                  onKeyDown={e => e.key === 'Enter' && handleCreate()} /></div>
              {pinError && <div style={{ fontSize: 13, color: 'var(--danger)', background: 'rgba(248,113,113,0.08)', padding: '10px 14px', borderRadius: 8 }}>{pinError}</div>}
            </div>
            <div style={{ display: 'flex', gap: 10 }}>
              <button style={{ padding: '14px 18px', background: 'transparent', border: '1px solid var(--border)', borderRadius: 12, color: 'var(--text-secondary)', fontSize: 14, fontFamily: 'Sora, sans-serif', cursor: 'pointer' }} onClick={() => setScreen('create-1')}>← Back</button>
              <button style={{ ...btnStyle, flex: 1, opacity: !pin || !confirmPin ? 0.5 : 1 }} onClick={handleCreate} disabled={!pin || !confirmPin}>Create Account →</button>
            </div>
            <p style={{ fontSize: 12, color: 'var(--text-muted)', textAlign: 'center', marginTop: 14 }}>Write your PIN down somewhere safe — it cannot be recovered.</p>
          </>
        )}
      </div>
    </div>
  );
}
