import React from 'react';
import {
  LayoutDashboard, ArrowLeftRight, PieChart, Target, Lightbulb, MessageSquare,
  Settings, TrendingUp, Bell, Menu, X, Receipt, BarChart3, Landmark, ShieldCheck,
  Calendar, FileText, TrendingDown, Building2, Sparkles, Repeat, ScanLine, Smartphone
} from 'lucide-react';
import { ActivePage, User } from '../../types';

interface TopBarProps { user: User | null; activePage: ActivePage; onMenuOpen: () => void; currencySymbol: string; }

const PAGE_LABELS: Record<ActivePage, string> = {
  dashboard:'Dashboard', transactions:'Transactions', budget:'Budgets', goals:'Goals',
  insights:'Insights', advisor:'AI Advisor', settings:'Settings',
  bills:'Bills & Recurring', investments:'Investments', networth:'Net Worth',
  emergency:'Emergency Fund', habits:'Daily Habits', alerts:'Alerts',
  receipt:'Receipt Scanner', forecast:'Spending Forecast', debt:'Debt Planner',
  calendar:'Financial Calendar', mpesa:'M-Pesa Import', stocks:'NSE Stocks',
  sacco:'SACCO Calculator', 'budget-ai':'AI Budget Generator', recurring:'Recurring Transactions',
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
          <h2 className="font-semibold text-sm" style={{ color: 'var(--text-primary)' }}>{PAGE_LABELS[activePage] || activePage}</h2>
          {activePage === 'dashboard' && <p className="text-xs hidden sm:block" style={{ color: 'var(--text-muted)' }}>{greeting}, {user?.name?.split(' ')[0] || 'User'} 👋</p>}
        </div>
      </div>
      <div className="flex items-center gap-2">
        <span className="hidden md:flex badge badge-gold text-xs">{currencySymbol} · {user?.country || 'US'}</span>
        <button className="btn-ghost p-2 rounded-lg relative">
          <Bell size={18} />
          <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full" style={{ background: 'var(--gold)' }} />
        </button>
        <div className="w-8 h-8 rounded-lg flex items-center justify-center font-bold text-sm" style={{ background: 'linear-gradient(135deg,#C9A84C,#E8C86D)', color: '#1A1000' }}>
          {(user?.name?.[0] || 'U').toUpperCase()}
        </div>
      </div>
    </header>
  );
}

const NAV_ALL = [
  { id: 'dashboard' as ActivePage,    label: 'Dashboard',          icon: LayoutDashboard },
  { id: 'transactions' as ActivePage, label: 'Transactions',       icon: ArrowLeftRight },
  { id: 'budget' as ActivePage,       label: 'Budgets',            icon: PieChart },
  { id: 'goals' as ActivePage,        label: 'Goals',              icon: Target },
  { id: 'insights' as ActivePage,     label: 'Insights',           icon: Lightbulb },
  { id: 'advisor' as ActivePage,      label: 'AI Advisor',         icon: MessageSquare },
  { id: 'receipt' as ActivePage,      label: 'Receipt Scanner',    icon: ScanLine },
  { id: 'mpesa' as ActivePage,        label: 'M-Pesa Import',      icon: Smartphone },
  { id: 'bills' as ActivePage,        label: 'Bills',              icon: Receipt },
  { id: 'forecast' as ActivePage,     label: 'Forecast',           icon: TrendingUp },
  { id: 'calendar' as ActivePage,     label: 'Calendar',           icon: Calendar },
  { id: 'debt' as ActivePage,         label: 'Debt Planner',       icon: TrendingDown },
  { id: 'recurring' as ActivePage,    label: 'Recurring',          icon: Repeat },
  { id: 'budget-ai' as ActivePage,    label: 'AI Budget',          icon: Sparkles },
  { id: 'investments' as ActivePage,  label: 'Investments',        icon: BarChart3 },
  { id: 'stocks' as ActivePage,       label: 'NSE Stocks',         icon: TrendingUp },
  { id: 'networth' as ActivePage,     label: 'Net Worth',          icon: Landmark },
  { id: 'emergency' as ActivePage,    label: 'Emergency Fund',     icon: ShieldCheck },
  { id: 'sacco' as ActivePage,        label: 'SACCO',              icon: Building2 },
  { id: 'habits' as ActivePage,       label: 'Daily Habits',       icon: Calendar },
  { id: 'settings' as ActivePage,     label: 'Settings',           icon: Settings },
];

interface MobileNavProps { isOpen: boolean; onClose: () => void; activePage: ActivePage; onNavigate: (page: ActivePage) => void; }

export function MobileNav({ isOpen, onClose, activePage, onNavigate }: MobileNavProps) {
  if (!isOpen) return null;
  const sections = [
    { title: 'Main', items: NAV_ALL.slice(0, 6) },
    { title: 'Tools', items: NAV_ALL.slice(6, 14) },
    { title: 'Wealth', items: NAV_ALL.slice(14) },
  ];
  return (
    <>
      <div className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm lg:hidden" onClick={onClose} />
      <div className="fixed left-0 top-0 h-full w-72 z-50 flex flex-col p-3 gap-0.5 overflow-y-auto lg:hidden"
        style={{ background: 'var(--bg-secondary)', borderRight: '1px solid var(--border)' }}>
        <div className="flex items-center justify-between px-3 py-3 mb-2">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-xl flex items-center justify-center" style={{ background: 'linear-gradient(135deg,#C9A84C,#E8C86D)' }}>
              <TrendingUp size={16} style={{ color: '#1A1000' }} />
            </div>
            <h1 className="font-bold text-sm gold-text" style={{ fontFamily: 'Fraunces, serif' }}>FinWise</h1>
          </div>
          <button onClick={onClose} className="btn-ghost p-2 rounded-lg"><X size={18} /></button>
        </div>
        {sections.map(section => (
          <div key={section.title}>
            <p className="px-3 text-xs font-semibold uppercase tracking-wider my-1" style={{ color: 'var(--text-muted)' }}>{section.title}</p>
            <nav className="flex flex-col gap-0.5">
              {section.items.map(({ id, label, icon: Icon }) => (
                <button key={id} onClick={() => { onNavigate(id); onClose(); }}
                  className={`nav-item text-left w-full ${activePage === id ? 'active' : ''}`}>
                  <Icon size={16} /><span className="text-sm">{label}</span>
                </button>
              ))}
            </nav>
            {section.title !== 'Wealth' && <div className="divider my-1" />}
          </div>
        ))}
      </div>
    </>
  );
}

const BOTTOM_TABS = [
  { id: 'dashboard' as ActivePage,    icon: LayoutDashboard },
  { id: 'transactions' as ActivePage, icon: ArrowLeftRight },
  { id: 'receipt' as ActivePage,      icon: ScanLine },
  { id: 'advisor' as ActivePage,      icon: MessageSquare },
  { id: 'settings' as ActivePage,     icon: Settings },
];

interface BottomTabBarProps { activePage: ActivePage; onNavigate: (page: ActivePage) => void; }
export function BottomTabBar({ activePage, onNavigate }: BottomTabBarProps) {
  return (
    <nav className="fixed bottom-0 left-0 right-0 z-30 flex lg:hidden border-t"
      style={{ background: 'rgba(10,10,21,0.95)', borderColor: 'var(--border)', backdropFilter: 'blur(20px)' }}>
      {BOTTOM_TABS.map(({ id, icon: Icon }) => (
        <button key={id} onClick={() => onNavigate(id)}
          className="flex-1 flex flex-col items-center justify-center py-3 gap-0.5 transition-all"
          style={{ color: activePage === id ? 'var(--gold)' : 'var(--text-muted)' }}>
          <Icon size={21} />
          {activePage === id && <div className="w-1 h-1 rounded-full" style={{ background: 'var(--gold)' }} />}
        </button>
      ))}
    </nav>
  );
}
