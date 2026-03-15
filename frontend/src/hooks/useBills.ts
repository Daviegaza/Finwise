import { useState, useCallback, useMemo } from 'react';
import type { Bill, BillStatus } from '../types';
import { generateId } from '../utils/investments';
import { BILL_META, getMonthlyTotal, getUpcomingBills, sortBillsByDueDate } from '../utils/bills';

const KEY = 'finwise_bills';
const load = (): Bill[] => { try { return JSON.parse(localStorage.getItem(KEY) || '[]'); } catch { return []; } };

export const useBills = () => {
  const [bills, setBills] = useState<Bill[]>(load);
  const save = (updated: Bill[]) => { setBills(updated); localStorage.setItem(KEY, JSON.stringify(updated)); };

  const addBill = useCallback((data: Omit<Bill, 'id'>) => save([...bills, { ...data, id: generateId() }]), [bills]);
  const removeBill = useCallback((id: string) => save(bills.filter(b => b.id !== id)), [bills]);
  const markPaid = useCallback((id: string) => save(bills.map(b => b.id === id ? { ...b, status: 'paid' as BillStatus, lastPaidDate: new Date().toISOString().slice(0, 10) } : b)), [bills]);
  const markUnpaid = useCallback((id: string) => save(bills.map(b => b.id === id ? { ...b, status: 'upcoming' as BillStatus } : b)), [bills]);

  const sortedBills = useMemo(() => sortBillsByDueDate(bills), [bills]);
  const monthlyTotal = useMemo(() => getMonthlyTotal(bills), [bills]);
  const upcomingThisWeek = useMemo(() => getUpcomingBills(bills, 7), [bills]);
  const overdueCount = useMemo(() => bills.filter(b => b.status === 'overdue').length, [bills]);
  const paidCount = useMemo(() => bills.filter(b => b.status === 'paid').length, [bills]);

  return { bills, sortedBills, monthlyTotal, upcomingThisWeek, overdueCount, paidCount, addBill, removeBill, markPaid, markUnpaid };
};
export { BILL_META };
