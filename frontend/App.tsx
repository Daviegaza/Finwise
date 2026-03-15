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
import BillsPage from './components/Bills/BillsPage';
import InvestmentsPage from './components/Investments/InvestmentsPage';
import NetWorthPage from './components/NetWorth/NetWorthPage';
import EmergencyFundPage from './components/Emergency/EmergencyFundPage';
import HabitsPage from './components/Habits/HabitsPage';
import ReceiptScanner from './components/Receipt/ReceiptScanner';
import ForecastPage from './components/Forecast/ForecastPage';
import DebtPage from './components/Debt/DebtPage';
import CalendarPage from './components/Calendar/CalendarPage';
import MpesaPage from './components/Mpesa/MpesaPage';
import StocksPage from './components/Stocks/StocksPage';
import SaccoPage from './components/Sacco/SaccoPage';
import BudgetAIPage from './components/BudgetAI/BudgetAIPage';
import RecurringPage from './components/Recurring/RecurringPage';
import PWAInstallPrompt from './components/PWAInstallPrompt';
import { useUser } from './hooks';
import { ActivePage } from './types';

export default function App() {
  const [activePage, setActivePage] = useState<ActivePage>('dashboard');
  const [mobileNavOpen, setMobileNavOpen] = useState(false);
  const [currency, setCurrency] = useState('USD');
  const [currencySymbol, setCurrencySymbol] = useState('$');
  const { user } = useUser();

  const handleCurrencyChange = (c: string, sym: string) => { setCurrency(c); setCurrencySymbol(sym); };

  const renderPage = () => {
    switch (activePage) {
      case 'dashboard':    return <DashboardPage currencySymbol={currencySymbol} onNavigate={setActivePage} />;
      case 'transactions': return <TransactionsPage currencySymbol={currencySymbol} currency={currency} />;
      case 'budget':       return <BudgetPage currencySymbol={currencySymbol} currency={currency} />;
      case 'goals':        return <GoalsPage currencySymbol={currencySymbol} currency={currency} />;
      case 'insights':     return <InsightsPage />;
      case 'advisor':      return <AIAdvisor />;
      case 'settings':     return <SettingsPage onCurrencyChange={handleCurrencyChange} />;
      case 'bills':        return <BillsPage />;
      case 'investments':  return <InvestmentsPage />;
      case 'networth':     return <NetWorthPage />;
      case 'emergency':    return <EmergencyFundPage />;
      case 'habits':       return <HabitsPage />;
      case 'receipt':      return <ReceiptScanner />;
      case 'forecast':     return <ForecastPage />;
      case 'debt':         return <DebtPage />;
      case 'calendar':     return <CalendarPage />;
      case 'mpesa':        return <MpesaPage />;
      case 'stocks':       return <StocksPage />;
      case 'sacco':        return <SaccoPage />;
      case 'budget-ai':    return <BudgetAIPage />;
      case 'recurring':    return <RecurringPage />;
      default:             return <DashboardPage currencySymbol={currencySymbol} onNavigate={setActivePage} />;
    }
  };

  return (
    <div className="flex min-h-screen" style={{ background: 'var(--bg-primary)' }}>
      <Sidebar activePage={activePage} onNavigate={setActivePage} />
      <MobileNav isOpen={mobileNavOpen} onClose={() => setMobileNavOpen(false)} activePage={activePage} onNavigate={setActivePage} />
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <TopBar user={user} activePage={activePage} onMenuOpen={() => setMobileNavOpen(true)} currencySymbol={currencySymbol} />
        <main className="flex-1 overflow-y-auto scroll-container p-4 lg:p-6 pb-24 lg:pb-6">
          <div className="max-w-6xl mx-auto">{renderPage()}</div>
        </main>
      </div>
      <BottomTabBar activePage={activePage} onNavigate={setActivePage} />
      <Toaster position="top-right" toastOptions={{
        style: { background: 'var(--bg-card)', color: 'var(--text-primary)', border: '1px solid var(--border)', borderRadius: '12px', fontSize: '13px', fontFamily: 'Sora, sans-serif' },
        success: { iconTheme: { primary: 'var(--success)', secondary: 'var(--bg-card)' } },
        error: { iconTheme: { primary: 'var(--danger)', secondary: 'var(--bg-card)' } },
      }} />
      <PWAInstallPrompt />
    </div>
  );
}
