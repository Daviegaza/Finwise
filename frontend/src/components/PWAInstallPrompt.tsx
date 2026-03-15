import React, { useState, useEffect } from 'react';
import { Download, X } from 'lucide-react';

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

export default function PWAInstallPrompt() {
  const [prompt, setPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [dismissed, setDismissed] = useState(() => localStorage.getItem('pwa_dismissed') === 'true');
  const [installed, setInstalled] = useState(false);

  useEffect(() => {
    const handler = (e: Event) => {
      e.preventDefault();
      setPrompt(e as BeforeInstallPromptEvent);
    };
    window.addEventListener('beforeinstallprompt', handler);
    window.addEventListener('appinstalled', () => setInstalled(true));
    return () => window.removeEventListener('beforeinstallprompt', handler);
  }, []);

  if (!prompt || dismissed || installed) return null;

  const handleInstall = async () => {
    if (!prompt) return;
    await prompt.prompt();
    const { outcome } = await prompt.userChoice;
    if (outcome === 'accepted') setInstalled(true);
    setPrompt(null);
  };

  const handleDismiss = () => {
    setDismissed(true);
    localStorage.setItem('pwa_dismissed', 'true');
  };

  return (
    <div className="fixed bottom-20 lg:bottom-6 left-4 right-4 lg:left-auto lg:right-6 lg:w-80 z-40 card p-4 flex items-center gap-3 shadow-xl animate-fade-slide-up"
      style={{ borderColor: 'rgba(201,168,76,0.3)', background: 'var(--bg-card)' }}>
      <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
        style={{ background: 'linear-gradient(135deg,#C9A84C,#E8C86D)' }}>
        <Download size={18} style={{ color: '#1A1000' }} />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>Install FinWise</p>
        <p className="text-xs" style={{ color: 'var(--text-muted)' }}>Add to home screen for faster access</p>
      </div>
      <div className="flex items-center gap-1 flex-shrink-0">
        <button onClick={handleInstall} className="btn-gold text-xs px-3 py-1.5">Install</button>
        <button onClick={handleDismiss} className="w-7 h-7 rounded-lg flex items-center justify-center" style={{ color: 'var(--text-muted)' }}>
          <X size={14} />
        </button>
      </div>
    </div>
  );
}
