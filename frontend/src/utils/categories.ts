import { TransactionCategory } from '../types';

export interface CategoryConfig {
  label: string;
  icon: string;
  color: string;
  bgColor: string;
  gradient: string;
}

export const CATEGORY_CONFIG: Record<TransactionCategory, CategoryConfig> = {
  housing:       { label: 'Housing',       icon: '🏠', color: '#60A5FA', bgColor: 'rgba(96,165,250,0.12)',  gradient: 'linear-gradient(135deg,#60A5FA,#3B82F6)' },
  food:          { label: 'Food & Dining', icon: '🍽️', color: '#FBBF24', bgColor: 'rgba(251,191,36,0.12)',  gradient: 'linear-gradient(135deg,#FBBF24,#F59E0B)' },
  transport:     { label: 'Transport',     icon: '🚗', color: '#34D399', bgColor: 'rgba(52,211,153,0.12)',  gradient: 'linear-gradient(135deg,#34D399,#10B981)' },
  healthcare:    { label: 'Healthcare',    icon: '💊', color: '#F87171', bgColor: 'rgba(248,113,113,0.12)', gradient: 'linear-gradient(135deg,#F87171,#EF4444)' },
  entertainment: { label: 'Entertainment', icon: '🎬', color: '#A78BFA', bgColor: 'rgba(167,139,250,0.12)', gradient: 'linear-gradient(135deg,#A78BFA,#8B5CF6)' },
  shopping:      { label: 'Shopping',      icon: '🛍️', color: '#F472B6', bgColor: 'rgba(244,114,182,0.12)', gradient: 'linear-gradient(135deg,#F472B6,#EC4899)' },
  education:     { label: 'Education',     icon: '📚', color: '#38BDF8', bgColor: 'rgba(56,189,248,0.12)',  gradient: 'linear-gradient(135deg,#38BDF8,#0EA5E9)' },
  utilities:     { label: 'Utilities',     icon: '⚡', color: '#06B6D4', bgColor: 'rgba(6,182,212,0.12)',   gradient: 'linear-gradient(135deg,#06B6D4,#0891B2)' },
  insurance:     { label: 'Insurance',     icon: '🛡️', color: '#84CC16', bgColor: 'rgba(132,204,22,0.12)',  gradient: 'linear-gradient(135deg,#84CC16,#65A30D)' },
  savings:       { label: 'Savings',       icon: '💰', color: '#C9A84C', bgColor: 'rgba(201,168,76,0.12)',  gradient: 'linear-gradient(135deg,#C9A84C,#A07830)' },
  investment:    { label: 'Investment',    icon: '📈', color: '#34D399', bgColor: 'rgba(52,211,153,0.12)',  gradient: 'linear-gradient(135deg,#34D399,#059669)' },
  income:        { label: 'Income',        icon: '💵', color: '#34D399', bgColor: 'rgba(52,211,153,0.12)',  gradient: 'linear-gradient(135deg,#34D399,#059669)' },
  freelance:     { label: 'Freelance',     icon: '💻', color: '#C9A84C', bgColor: 'rgba(201,168,76,0.12)',  gradient: 'linear-gradient(135deg,#C9A84C,#A07830)' },
  salary:        { label: 'Salary',        icon: '🏦', color: '#34D399', bgColor: 'rgba(52,211,153,0.12)',  gradient: 'linear-gradient(135deg,#34D399,#059669)' },
  business:      { label: 'Business',      icon: '💼', color: '#60A5FA', bgColor: 'rgba(96,165,250,0.12)',  gradient: 'linear-gradient(135deg,#60A5FA,#3B82F6)' },
  other:         { label: 'Other',         icon: '📦', color: '#94A3B8', bgColor: 'rgba(148,163,184,0.12)', gradient: 'linear-gradient(135deg,#94A3B8,#64748B)' },
};

export const INCOME_CATEGORIES: TransactionCategory[] = ['salary', 'freelance', 'income', 'business', 'investment'];
export const EXPENSE_CATEGORIES: TransactionCategory[] = [
  'housing', 'food', 'transport', 'healthcare', 'entertainment',
  'shopping', 'education', 'utilities', 'insurance', 'savings', 'other'
];

export function formatCurrency(amount: number, symbol: string = '$', decimals: number = 2): string {
  if (Math.abs(amount) >= 1_000_000) return `${symbol}${(amount / 1_000_000).toFixed(1)}M`;
  if (Math.abs(amount) >= 1_000) return `${symbol}${(amount / 1_000).toFixed(1)}K`;
  return `${symbol}${Math.abs(amount).toFixed(decimals)}`;
}

export function formatDate(dateStr: string): string {
  const d = new Date(dateStr);
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

export function formatRelativeDate(dateStr: string): string {
  const d = new Date(dateStr);
  const now = new Date();
  const diff = now.getTime() - d.getTime();
  const days = Math.floor(diff / (1000 * 60 * 60 * 24));
  if (days === 0) return 'Today';
  if (days === 1) return 'Yesterday';
  if (days < 7) return `${days} days ago`;
  if (days < 30) return `${Math.floor(days / 7)} weeks ago`;
  return formatDate(dateStr);
}

export function getDaysLeft(targetDate: string): number {
  return Math.ceil((new Date(targetDate).getTime() - Date.now()) / (1000 * 60 * 60 * 24));
}

export function getProgressColor(percentage: number): string {
  if (percentage >= 90) return '#F87171';
  if (percentage >= 70) return '#FBBF24';
  return '#C9A84C';
}

export const CURRENCIES: Record<string, { symbol: string; name: string }> = {
  USD: { symbol: '$', name: 'US Dollar' },
  EUR: { symbol: '€', name: 'Euro' },
  GBP: { symbol: '£', name: 'British Pound' },
  KES: { symbol: 'KSh', name: 'Kenyan Shilling' },
  NGN: { symbol: '₦', name: 'Nigerian Naira' },
  ZAR: { symbol: 'R', name: 'South African Rand' },
  INR: { symbol: '₹', name: 'Indian Rupee' },
  JPY: { symbol: '¥', name: 'Japanese Yen' },
  CAD: { symbol: 'C$', name: 'Canadian Dollar' },
  AUD: { symbol: 'A$', name: 'Australian Dollar' },
  BRL: { symbol: 'R$', name: 'Brazilian Real' },
  GHS: { symbol: 'GH₵', name: 'Ghanaian Cedi' },
  SGD: { symbol: 'S$', name: 'Singapore Dollar' },
  AED: { symbol: 'AED', name: 'UAE Dirham' },
  EGP: { symbol: 'E£', name: 'Egyptian Pound' },
};
