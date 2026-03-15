import React from 'react';
import {
  LayoutDashboard, ArrowLeftRight, PieChart, Target,
  Lightbulb, MessageSquare, Settings, Zap, TrendingUp,
  Receipt, Landmark, ShieldCheck, BarChart3, Calendar
} from 'lucide-react';
import { ActivePage } from '../../types';

interface SidebarProps {
  activePage: ActivePage;
  onNavigate: (page: ActivePage) => void;
}

const NAV_MAIN = [
  { id: 'dashboard' as ActivePage,    label: 'Dashboard',      icon: LayoutDashboard },
  { id: 'transactions' as ActivePage, label: 'Transactions',   icon: ArrowLeftRight },
  { id: 'budget' as ActivePage,       label: 'Budgets',        icon: PieChart },
  { id: 'goals' as ActivePage,        label: 'Goals',          icon: Target },
  { id: 'insights' as ActivePage,     label: 'Insights',       icon: Lightbulb, badge: 'NEW' },
  { id: 'advisor' as ActivePage,      label: 'AI Advisor',     icon: MessageSquare, badge: 'AI' },
];

const NAV_TOOLS = [
  { id: 'bills' as ActivePage,        label: 'Bills',          icon: Receipt },
  { id: 'investments' as ActivePage,  label: 'Investments',    icon: BarChart3 },
  { id: 'networth' as ActivePage,     label: 'Net Worth',      icon: Landmark },
  { id: 'emergency' as ActivePage,    label: 'Emergency Fund', icon: ShieldCheck },
  { id: 'habits' as ActivePage,       label: 'Daily Habits',   icon: Calendar },
];

export default function Sidebar({ activePage, onNavigate }: SidebarProps) {
  return (
    <aside className="hidden lg:flex flex-col w-64 h-screen sticky top-0 border-r p-4 gap-1 overflow-y-auto"
      style={{ background: 'var(--bg-secondary)', borderColor: 'var(--border)' }}>

      {/* Logo */}
      <div className="flex items-center gap-3 px-3 py-4 mb-2">
        <div className="relative">
          <div className="w-9 h-9 rounded-xl flex items-center justify-center"
            style={{ background: 'linear-gradient(135deg, #C9A84C, #E8C86D)' }}>
            <TrendingUp size={18} style={{ color: '#1A1000' }} />
          </div>
          <div className="absolute -top-1 -right-1 w-3 h-3 rounded-full border-2 animate-pulse"
            style={{ background: '#34D399', borderColor: 'var(--bg-secondary)' }} />
        </div>
        <div>
          <h1 className="font-bold text-base leading-tight" style={{ fontFamily: 'Fraunces, serif' }}>
            <span className="gold-text">Fin</span>Wise
          </h1>
          <p className="text-xs" style={{ color: 'var(--text-muted)' }}>AI Financial Advisor</p>
        </div>
      </div>

      <p className="px-3 text-xs font-semibold mb-1 uppercase tracking-wider" style={{ color: 'var(--text-muted)' }}>Main Menu</p>
      <nav className="flex flex-col gap-1">
        {NAV_MAIN.map(({ id, label, icon: Icon, badge }) => (
          <button key={id} onClick={() => onNavigate(id)} className={`nav-item text-left w-full ${activePage === id ? 'active' : ''}`}>
            <Icon size={18} />
            <span className="flex-1">{label}</span>
            {badge && <span className="badge badge-gold text-xs px-1.5 py-0.5 rounded-md" style={{ fontSize: '10px' }}>{badge}</span>}
          </button>
        ))}
      </nav>

      <div className="divider my-2" />
      <p className="px-3 text-xs font-semibold mb-1 uppercase tracking-wider" style={{ color: 'var(--text-muted)' }}>Tools</p>
      <nav className="flex flex-col gap-1">
        {NAV_TOOLS.map(({ id, label, icon: Icon }) => (
          <button key={id} onClick={() => onNavigate(id)} className={`nav-item text-left w-full ${activePage === id ? 'active' : ''}`}>
            <Icon size={18} />
            <span className="flex-1">{label}</span>
          </button>
        ))}
      </nav>

      <div className="card p-3 mx-1 mt-3 mb-2" style={{ background: 'rgba(201,168,76,0.06)' }}>
        <div className="flex items-center gap-2 mb-2">
          <Zap size={14} style={{ color: 'var(--gold)' }} />
          <span className="text-xs font-medium" style={{ color: 'var(--gold)' }}>Financial Health</span>
        </div>
        <div className="progress-bar mb-1.5"><div className="progress-fill" style={{ width: '72%' }} /></div>
        <p className="text-xs" style={{ color: 'var(--text-muted)' }}>Score: 72/100 · Good</p>
      </div>

      <div className="divider mb-2" />
      <button onClick={() => onNavigate('settings')} className={`nav-item text-left w-full ${activePage === 'settings' ? 'active' : ''}`}>
        <Settings size={18} /><span>Settings</span>
      </button>
      <div className="px-3 mt-2">
        <p className="text-xs" style={{ color: 'var(--text-muted)' }}>FinWise v2.0 · Global Edition</p>
      </div>
    </aside>
  );
}
