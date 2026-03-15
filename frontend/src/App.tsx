import React, { useState } from 'react';
import { Toaster } from 'react-hot-toast';
import Sidebar from './components/Layout/Sidebar';
import { TopBar, MobileNav, BottomTabBar } from './components/Layout/TopBar';
import DashboardPage from './components/Dashboard/DashboardPage';
import TransactionsPage from './components/Transactions/TransactionsPage';
import BudgetPage from './components/Budget/BudgetPage';
import GoalsPage from './components/Budget/GoalsPage';
import InsightsPage from './components/Insights/InsightsPage';
import AIAdvisor from './components/AIAdvisor/AIAdvisor';
import SettingsPage from './components/Settings/SettingsPage';
import { useUser } from './hooks';
import { ActivePage } from './types';
import { CURRENCIES } from './utils/categories';

export default function App() {
  const [activePage, setActivePage] = useState<ActivePage>('dashboard');
  const [mobileNavOpen, setMobileNavOpen] = useState(false);
  const [currency, setCurrency] = useState('USD');
  const [currencySymbol, setCurrencySymbol] = useState('$');
  const { user } = useUser();

  const handleCurrencyChange = (c: string, sym: string) => {
    setCurrency(c);
    setCurrencySymbol(sym);
  };

  const renderPage = () => {
    switch (activePage) {
      case 'dashboard':
        return <DashboardPage currencySymbol={currencySymbol} onNavigate={setActivePage} />;
      case 'transactions':
        return <TransactionsPage currencySymbol={currencySymbol} currency={currency} />;
      case 'budget':
        return <BudgetPage currencySymbol={currencySymbol} currency={currency} />;
      case 'goals':
        return <GoalsPage currencySymbol={currencySymbol} currency={currency} />;
      case 'insights':
        return <InsightsPage />;
      case 'advisor':
        return <AIAdvisor />;
      case 'settings':
        return <SettingsPage onCurrencyChange={handleCurrencyChange} />;
      default:
        return <DashboardPage currencySymbol={currencySymbol} onNavigate={setActivePage} />;
    }
  };

  return (
    <div className="flex min-h-screen" style={{ background: 'var(--bg-primary)' }}>
      {/* Desktop sidebar */}
      <Sidebar activePage={activePage} onNavigate={setActivePage} />

      {/* Mobile nav drawer */}
      <MobileNav
        isOpen={mobileNavOpen}
        onClose={() => setMobileNavOpen(false)}
        activePage={activePage}
        onNavigate={setActivePage}
      />

      {/* Main content */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <TopBar
          user={user}
          activePage={activePage}
          onMenuOpen={() => setMobileNavOpen(true)}
          currencySymbol={currencySymbol}
        />

        <main className="flex-1 overflow-y-auto scroll-container p-4 lg:p-6 pb-24 lg:pb-6">
          <div className="max-w-6xl mx-auto">
            {renderPage()}
          </div>
        </main>
      </div>

      {/* Mobile bottom tab bar */}
      <BottomTabBar activePage={activePage} onNavigate={setActivePage} />

      {/* Toast notifications */}
      <Toaster
        position="top-right"
        toastOptions={{
          style: {
            background: 'var(--bg-card)',
            color: 'var(--text-primary)',
            border: '1px solid var(--border)',
            borderRadius: '12px',
            fontSize: '13px',
            fontFamily: 'Sora, sans-serif',
          },
          success: { iconTheme: { primary: 'var(--success)', secondary: 'var(--bg-card)' } },
          error: { iconTheme: { primary: 'var(--danger)', secondary: 'var(--bg-card)' } },
        }}
      />
    </div>
  );
}
