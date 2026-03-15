import React from 'react';
import {
  LayoutDashboard, ArrowLeftRight, PieChart, Target, Lightbulb,
  MessageSquare, Settings, TrendingUp, Bell, Menu, X, Receipt,
  BarChart3, Landmark, ShieldCheck, Calendar
} from 'lucide-react';
import { ActivePage, User } from '../../types';

interface TopBarProps {
  user: User | null;
  activePage: ActivePage;
  onMenuOpen: () => void;
  currencySymbol: string;
}

const PAGE_LABELS: Record<ActivePage, string> = {
  dashboard: 'Dashboard', transactions: 'Transactions', budget: 'Budgets',
  goals: 'Goals', insights: 'Insights', advisor: 'AI Advisor', settings: 'Settings',
  bills: 'Bills & Recurring', investments: 'Investments', networth: 'Net Worth',
  emergency: 'Emergency Fund', habits: 'Daily Habits', alerts: 'Alerts',
};

export function TopBar({ user, activePage, onMenuOpen, currencySymbol }: TopBarProps) {
  const hour = new Date().getHours();
  const greeting = hour < 12 ? 'Good morning' : hour < 17 ? 'Good afternoon' : 'Good evening';

  return (
    <header className="flex items-center justify-between px-4 lg:px-6 py-3 border-b sticky top-0 z-30"
      style={{ background: 'rgba(10,10,21,0.85)', borderColor: 'var(--border)', backdropFilter: 'blur(20px)' }}>
      <div className="flex items-center gap-3">
        <button onClick={onMenuOpen} className="lg:hidden btn-ghost p-2 rounded-lg"><Menu size={20} /></button>
        <div>
          <h2 className="font-semibold text-sm" style={{ color: 'var(--text-primary)' }}>{PAGE_LABELS[activePage]}</h2>
          {activePage === 'dashboard' && (
            <p className="text-xs hidden sm:block" style={{ color: 'var(--text-muted)' }}>
              {greeting}, {user?.name?.split(' ')[0] || 'User'} 👋
            </p>
          )}
        </div>
      </div>
      <div className="flex items-center gap-2">
        <span className="hidden md:flex badge badge-gold text-xs">{currencySymbol} · {user?.country || 'US'}</span>
        <button className="btn-ghost p-2 rounded-lg relative">
          <Bell size={18} />
          <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full" style={{ background: 'var(--gold)' }} />
        </button>
        <div className="w-8 h-8 rounded-lg flex items-center justify-center font-bold text-sm flex-shrink-0"
          style={{ background: 'linear-gradient(135deg, #C9A84C, #E8C86D)', color: '#1A1000' }}>
          {(user?.name?.[0] || 'U').toUpperCase()}
        </div>
      </div>
    </header>
  );
}

// ─── Mobile Nav Drawer ────────────────────────────────────
interface MobileNavProps {
  isOpen: boolean;
  onClose: () => void;
  activePage: ActivePage;
  onNavigate: (page: ActivePage) => void;
}

const NAV_MAIN = [
  { id: 'dashboard' as ActivePage,    label: 'Dashboard',      icon: LayoutDashboard },
  { id: 'transactions' as ActivePage, label: 'Transactions',   icon: ArrowLeftRight },
  { id: 'budget' as ActivePage,       label: 'Budgets',        icon: PieChart },
  { id: 'goals' as ActivePage,        label: 'Goals',          icon: Target },
  { id: 'insights' as ActivePage,     label: 'Insights',       icon: Lightbulb },
  { id: 'advisor' as ActivePage,      label: 'AI Advisor',     icon: MessageSquare },
];

const NAV_TOOLS = [
  { id: 'bills' as ActivePage,        label: 'Bills',          icon: Receipt },
  { id: 'investments' as ActivePage,  label: 'Investments',    icon: BarChart3 },
  { id: 'networth' as ActivePage,     label: 'Net Worth',      icon: Landmark },
  { id: 'emergency' as ActivePage,    label: 'Emergency Fund', icon: ShieldCheck },
  { id: 'habits' as ActivePage,       label: 'Daily Habits',   icon: Calendar },
];

export function MobileNav({ isOpen, onClose, activePage, onNavigate }: MobileNavProps) {
  if (!isOpen) return null;
  return (
    <>
      <div className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm lg:hidden" onClick={onClose} />
      <div className="fixed left-0 top-0 h-full w-72 z-50 flex flex-col p-4 gap-1 overflow-y-auto lg:hidden animate-fade-slide-up"
        style={{ background: 'var(--bg-secondary)', borderRight: '1px solid var(--border)' }}>
        <div className="flex items-center justify-between px-3 py-3 mb-3">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl flex items-center justify-center" style={{ background: 'linear-gradient(135deg, #C9A84C, #E8C86D)' }}>
              <TrendingUp size={18} style={{ color: '#1A1000' }} />
            </div>
            <h1 className="font-bold text-base gold-text" style={{ fontFamily: 'Fraunces, serif' }}>FinWise</h1>
          </div>
          <button onClick={onClose} className="btn-ghost p-2 rounded-lg"><X size={18} /></button>
        </div>

        <p className="px-3 text-xs font-semibold uppercase tracking-wider mb-1" style={{ color: 'var(--text-muted)' }}>Main Menu</p>
        <nav className="flex flex-col gap-1">
          {NAV_MAIN.map(({ id, label, icon: Icon }) => (
            <button key={id} onClick={() => { onNavigate(id); onClose(); }} className={`nav-item text-left w-full ${activePage === id ? 'active' : ''}`}>
              <Icon size={18} /><span>{label}</span>
            </button>
          ))}
        </nav>

        <div className="divider my-2" />
        <p className="px-3 text-xs font-semibold uppercase tracking-wider mb-1" style={{ color: 'var(--text-muted)' }}>Tools</p>
        <nav className="flex flex-col gap-1">
          {NAV_TOOLS.map(({ id, label, icon: Icon }) => (
            <button key={id} onClick={() => { onNavigate(id); onClose(); }} className={`nav-item text-left w-full ${activePage === id ? 'active' : ''}`}>
              <Icon size={18} /><span>{label}</span>
            </button>
          ))}
        </nav>

        <div className="divider my-2" />
        <button onClick={() => { onNavigate('settings'); onClose(); }} className={`nav-item text-left w-full ${activePage === 'settings' ? 'active' : ''}`}>
          <Settings size={18} /><span>Settings</span>
        </button>
      </div>
    </>
  );
}

// ─── Bottom Tab Bar (Mobile) ──────────────────────────────
const BOTTOM_TABS: { id: ActivePage; icon: React.ComponentType<{ size?: number }> }[] = [
  { id: 'dashboard',    icon: LayoutDashboard },
  { id: 'transactions', icon: ArrowLeftRight },
  { id: 'advisor',      icon: MessageSquare },
  { id: 'bills',        icon: Receipt },
  { id: 'settings',     icon: Settings },
];

interface BottomTabBarProps {
  activePage: ActivePage;
  onNavigate: (page: ActivePage) => void;
}

export function BottomTabBar({ activePage, onNavigate }: BottomTabBarProps) {
  return (
    <nav className="fixed bottom-0 left-0 right-0 z-30 flex lg:hidden border-t"
      style={{ background: 'rgba(10,10,21,0.95)', borderColor: 'var(--border)', backdropFilter: 'blur(20px)' }}>
      {BOTTOM_TABS.map(({ id, icon: Icon }) => (
        <button key={id} onClick={() => onNavigate(id)}
          className="flex-1 flex flex-col items-center justify-center py-3 gap-1 transition-all duration-200"
          style={{ color: activePage === id ? 'var(--gold)' : 'var(--text-muted)' }}>
          <Icon size={22} />
          {activePage === id && <div className="w-1 h-1 rounded-full" style={{ background: 'var(--gold)' }} />}
        </button>
      ))}
    </nav>
  );
}
