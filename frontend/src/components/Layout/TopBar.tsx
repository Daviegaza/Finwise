import React, { useState } from 'react';
import {
  Bell, Search, Menu, X, LayoutDashboard, ArrowLeftRight,
  PieChart, Target, Lightbulb, MessageSquare, Settings, TrendingUp
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
};

export function TopBar({ user, activePage, onMenuOpen, currencySymbol }: TopBarProps) {
  const now = new Date();
  const hour = now.getHours();
  const greeting = hour < 12 ? 'Good morning' : hour < 17 ? 'Good afternoon' : 'Good evening';

  return (
    <header className="flex items-center justify-between px-4 lg:px-6 py-3 border-b sticky top-0 z-30"
      style={{ background: 'rgba(10,10,21,0.85)', borderColor: 'var(--border)', backdropFilter: 'blur(20px)' }}>

      {/* Left: Mobile menu + breadcrumb */}
      <div className="flex items-center gap-3">
        <button onClick={onMenuOpen} className="lg:hidden btn-ghost p-2 rounded-lg">
          <Menu size={20} />
        </button>
        <div>
          <h2 className="font-semibold text-sm" style={{ color: 'var(--text-primary)' }}>
            {PAGE_LABELS[activePage]}
          </h2>
          {activePage === 'dashboard' && (
            <p className="text-xs hidden sm:block" style={{ color: 'var(--text-muted)' }}>
              {greeting}, {user?.name?.split(' ')[0] || 'User'} 👋
            </p>
          )}
        </div>
      </div>

      {/* Right: Actions */}
      <div className="flex items-center gap-2">
        <span className="hidden md:flex badge badge-gold text-xs">
          {currencySymbol} · {user?.country || 'US'}
        </span>
        <button className="btn-ghost p-2 rounded-lg relative">
          <Bell size={18} />
          <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full" style={{ background: 'var(--gold)' }} />
        </button>
        <div className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold"
          style={{ background: 'linear-gradient(135deg,#C9A84C,#E8C86D)', color: '#1A1000' }}>
          {user?.name?.charAt(0) || 'U'}
        </div>
      </div>
    </header>
  );
}

interface MobileNavProps {
  isOpen: boolean;
  onClose: () => void;
  activePage: ActivePage;
  onNavigate: (page: ActivePage) => void;
}

const NAV_ITEMS: { id: ActivePage; label: string; icon: React.ComponentType<{ size?: number }> }[] = [
  { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { id: 'transactions', label: 'Transactions', icon: ArrowLeftRight },
  { id: 'budget', label: 'Budgets', icon: PieChart },
  { id: 'goals', label: 'Goals', icon: Target },
  { id: 'insights', label: 'Insights', icon: Lightbulb },
  { id: 'advisor', label: 'AI Advisor', icon: MessageSquare },
  { id: 'settings', label: 'Settings', icon: Settings },
];

export function MobileNav({ isOpen, onClose, activePage, onNavigate }: MobileNavProps) {
  if (!isOpen) return null;

  return (
    <>
      {/* Backdrop */}
      <div className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm lg:hidden" onClick={onClose} />

      {/* Drawer */}
      <div className="fixed left-0 top-0 h-full w-72 z-50 flex flex-col p-4 gap-1 lg:hidden animate-fade-slide-up"
        style={{ background: 'var(--bg-secondary)', borderRight: '1px solid var(--border)' }}>

        <div className="flex items-center justify-between px-3 py-3 mb-4">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl flex items-center justify-center"
              style={{ background: 'linear-gradient(135deg, #C9A84C, #E8C86D)' }}>
              <TrendingUp size={18} style={{ color: '#1A1000' }} />
            </div>
            <h1 className="font-bold text-base gold-text" style={{ fontFamily: 'Fraunces, serif' }}>
              FinWise
            </h1>
          </div>
          <button onClick={onClose} className="btn-ghost p-2 rounded-lg">
            <X size={18} />
          </button>
        </div>

        <nav className="flex flex-col gap-1 flex-1">
          {NAV_ITEMS.map(({ id, label, icon: Icon }) => (
            <button
              key={id}
              onClick={() => { onNavigate(id); onClose(); }}
              className={`nav-item text-left w-full ${activePage === id ? 'active' : ''}`}
            >
              <Icon size={18} />
              <span>{label}</span>
            </button>
          ))}
        </nav>
      </div>
    </>
  );
}

// ─── Bottom Tab Bar (Mobile) ──────────────────────────────
const BOTTOM_TABS: { id: ActivePage; icon: React.ComponentType<{ size?: number }> }[] = [
  { id: 'dashboard',    icon: LayoutDashboard },
  { id: 'transactions', icon: ArrowLeftRight },
  { id: 'advisor',      icon: MessageSquare },
  { id: 'budget',       icon: PieChart },
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
        <button
          key={id}
          onClick={() => onNavigate(id)}
          className="flex-1 flex flex-col items-center justify-center py-3 gap-1 transition-all duration-200"
          style={{ color: activePage === id ? 'var(--gold)' : 'var(--text-muted)' }}
        >
          <Icon size={22} />
          {activePage === id && (
            <div className="w-1 h-1 rounded-full" style={{ background: 'var(--gold)' }} />
          )}
        </button>
      ))}
    </nav>
  );
}
