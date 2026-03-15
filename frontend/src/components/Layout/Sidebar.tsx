import React from 'react';
import {
  LayoutDashboard, ArrowLeftRight, PieChart, Target,
  Lightbulb, MessageSquare, Settings, Zap, TrendingUp
} from 'lucide-react';
import { ActivePage } from '../../types';

interface SidebarProps {
  activePage: ActivePage;
  onNavigate: (page: ActivePage) => void;
}

const NAV_ITEMS: { id: ActivePage; label: string; icon: React.ComponentType<{ size?: number; className?: string }>; badge?: string }[] = [
  { id: 'dashboard',    label: 'Dashboard',    icon: LayoutDashboard },
  { id: 'transactions', label: 'Transactions', icon: ArrowLeftRight },
  { id: 'budget',       label: 'Budgets',      icon: PieChart },
  { id: 'goals',        label: 'Goals',        icon: Target },
  { id: 'insights',     label: 'Insights',     icon: Lightbulb, badge: 'NEW' },
  { id: 'advisor',      label: 'AI Advisor',   icon: MessageSquare, badge: 'AI' },
];

const BOTTOM_ITEMS: { id: ActivePage; label: string; icon: React.ComponentType<{ size?: number; className?: string }> }[] = [
  { id: 'settings', label: 'Settings', icon: Settings },
];

export default function Sidebar({ activePage, onNavigate }: SidebarProps) {
  return (
    <aside className="hidden lg:flex flex-col w-64 h-screen sticky top-0 border-r p-4 gap-1"
      style={{ background: 'var(--bg-secondary)', borderColor: 'var(--border)' }}>

      {/* Logo */}
      <div className="flex items-center gap-3 px-3 py-4 mb-4">
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

      {/* Nav label */}
      <p className="px-3 text-xs font-semibold mb-2 uppercase tracking-wider" style={{ color: 'var(--text-muted)' }}>
        Main Menu
      </p>

      {/* Main nav */}
      <nav className="flex flex-col gap-1 flex-1">
        {NAV_ITEMS.map(({ id, label, icon: Icon, badge }) => (
          <button
            key={id}
            onClick={() => onNavigate(id)}
            className={`nav-item text-left w-full ${activePage === id ? 'active' : ''}`}
          >
            <Icon size={18} />
            <span className="flex-1">{label}</span>
            {badge && (
              <span className="badge badge-gold text-xs px-1.5 py-0.5 rounded-md" style={{ fontSize: '10px' }}>
                {badge}
              </span>
            )}
          </button>
        ))}
      </nav>

      {/* Quick stat */}
      <div className="card p-3 mx-1 mb-3" style={{ background: 'rgba(201,168,76,0.06)' }}>
        <div className="flex items-center gap-2 mb-2">
          <Zap size={14} style={{ color: 'var(--gold)' }} />
          <span className="text-xs font-medium" style={{ color: 'var(--gold)' }}>Financial Health</span>
        </div>
        <div className="progress-bar mb-1.5">
          <div className="progress-fill" style={{ width: '72%' }} />
        </div>
        <p className="text-xs" style={{ color: 'var(--text-muted)' }}>Score: 72/100 · Good</p>
      </div>

      {/* Bottom nav */}
      <div className="divider mb-2" />
      {BOTTOM_ITEMS.map(({ id, label, icon: Icon }) => (
        <button
          key={id}
          onClick={() => onNavigate(id)}
          className={`nav-item text-left w-full ${activePage === id ? 'active' : ''}`}
        >
          <Icon size={18} />
          <span>{label}</span>
        </button>
      ))}

      <div className="px-3 mt-2">
        <p className="text-xs" style={{ color: 'var(--text-muted)' }}>FinWise v1.0 · Global Edition</p>
      </div>
    </aside>
  );
}
