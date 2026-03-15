import type { AssetCategory, LiabilityCategory, NetWorthItem } from '../types';

export const ASSET_META: Record<AssetCategory, { label: string; icon: string; color: string }> = {
  cash:        { label: 'Cash & Savings',  icon: '💵', color: '#34D399' },
  investments: { label: 'Investments',     icon: '📈', color: '#60A5FA' },
  property:    { label: 'Property',        icon: '🏘️', color: '#FB923C' },
  vehicle:     { label: 'Vehicle',         icon: '🚗', color: '#7B82FF' },
  crypto:      { label: 'Crypto',          icon: '₿',  color: '#F59E0B' },
  pension:     { label: 'Pension / NSSF',  icon: '🌿', color: '#34D399' },
  business:    { label: 'Business Value',  icon: '💼', color: '#C9A84C' },
  other:       { label: 'Other Assets',    icon: '🧩', color: '#94A3B8' },
};

export const LIABILITY_META: Record<LiabilityCategory, { label: string; icon: string; color: string }> = {
  mortgage:     { label: 'Mortgage',      icon: '🏦', color: '#F87171' },
  carLoan:      { label: 'Car Loan',      icon: '🚗', color: '#FB923C' },
  personalLoan: { label: 'Personal Loan', icon: '💳', color: '#FBBF24' },
  creditCard:   { label: 'Credit Card',   icon: '💳', color: '#E879F9' },
  studentLoan:  { label: 'Student Loan',  icon: '📚', color: '#A78BFA' },
  other:        { label: 'Other Debts',   icon: '📋', color: '#94A3B8' },
};

export const calculateNetWorth = (items: NetWorthItem[]) => {
  const assets = items.filter(i => i.type === 'asset');
  const liabilities = items.filter(i => i.type === 'liability');
  const totalAssets = assets.reduce((s, i) => s + i.amount, 0);
  const totalLiabilities = liabilities.reduce((s, i) => s + i.amount, 0);
  const byCategory: Record<string, number> = {};
  for (const item of items) byCategory[item.category] = (byCategory[item.category] || 0) + item.amount;
  return { totalAssets, totalLiabilities, netWorth: totalAssets - totalLiabilities, byCategory };
};
