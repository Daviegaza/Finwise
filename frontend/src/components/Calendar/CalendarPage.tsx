import React, { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight, Calendar, DollarSign, Target, Receipt } from 'lucide-react';
import { getCurrencySymbol } from '../../utils/currency';

const BACKEND_URL = import.meta.env.VITE_API_URL || '';
const DAYS = ['Sun','Mon','Tue','Wed','Thu','Fri','Sat'];
const MONTHS = ['January','February','March','April','May','June','July','August','September','October','November','December'];

type EventType = 'bill' | 'income' | 'goal' | 'budget-reset' | 'transaction';
interface CalEvent { day: number; type: EventType; label: string; amount?: number; color: string; }

export default function CalendarPage() {
  const sym = getCurrencySymbol();
  const fmt = (n: number) => `${sym} ${Math.abs(n).toLocaleString('en-KE', { maximumFractionDigits: 0 })}`;
  const now = new Date();
  const [year, setYear] = useState(now.getFullYear());
  const [month, setMonth] = useState(now.getMonth());
  const [events, setEvents] = useState<CalEvent[]>([]);
  const [selected, setSelected] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const [fetchError, setFetchError] = useState('');

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      const ev: CalEvent[] = [];
      try {
        // Bills from localStorage
        const bills = JSON.parse(localStorage.getItem('finwise_bills') || '[]');
        bills.forEach((b: any) => {
          ev.push({ day: b.dueDay, type: 'bill', label: b.name, amount: b.amount, color: '#F87171' });
        });

        // Transactions this month
        const txRes = await fetch(`${BACKEND_URL}/api/transactions/demo-user?limit=100`);
        const { transactions } = await txRes.json();
        transactions
          .filter((t: any) => { const d = new Date(t.date); return d.getMonth() === month && d.getFullYear() === year; })
          .forEach((t: any) => {
            const d = new Date(t.date).getDate();
            ev.push({ day: d, type: 'transaction', label: t.description, amount: t.amount, color: t.type === 'income' ? '#34D399' : '#94A3B8' });
          });

        // Budget reset (1st of month)
        ev.push({ day: 1, type: 'budget-reset', label: 'Budget Reset', color: '#C9A84C' });

        // Goals from localStorage
        const goals = JSON.parse(localStorage.getItem('finwise_goals') || '[]');
        goals.forEach((g: any) => {
          if (!g.deadline) return;
          const d = new Date(g.deadline + '-01');
          if (d.getMonth() === month && d.getFullYear() === year) {
            ev.push({ day: 1, type: 'goal', label: g.name + ' deadline', color: '#60A5FA' });
          }
        });
      } catch (e) { console.error(e); }
      setEvents(ev);
      setLoading(false);
    };
    load();
  }, [month, year]);

  const firstDay = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const cells: (number | null)[] = [...Array(firstDay).fill(null), ...Array.from({length: daysInMonth}, (_, i) => i + 1)];
  while (cells.length % 7 !== 0) cells.push(null);

  const getEvents = (day: number) => events.filter(e => e.day === day);

  const prev = () => { if (month === 0) { setMonth(11); setYear(y => y-1); } else setMonth(m => m-1); };
  const next = () => { if (month === 11) { setMonth(0); setYear(y => y+1); } else setMonth(m => m+1); };

  const selectedEvents = selected ? getEvents(selected) : [];

  return (
    <div className="flex flex-col gap-4">
      <div>
        <h2 className="section-title">Financial Calendar</h2>
        <p className="section-subtitle">Bills, income, goals and transactions at a glance</p>
      </div>

      {/* Legend */}
      <div className="flex gap-4 flex-wrap">
        {[['#F87171','Bills'],['#34D399','Income'],['#C9A84C','Budget Reset'],['#60A5FA','Goal Deadline'],['#94A3B8','Expenses']].map(([color, label]) => (
          <div key={label} className="flex items-center gap-1.5">
            <div className="w-2.5 h-2.5 rounded-full" style={{ background: color }} />
            <span className="text-xs" style={{ color: 'var(--text-muted)' }}>{label}</span>
          </div>
        ))}
      </div>

      <div className="card overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b" style={{ borderColor: 'var(--border)' }}>
          <button onClick={prev} className="w-8 h-8 rounded-lg flex items-center justify-center btn-ghost"><ChevronLeft size={16} /></button>
          <h3 className="font-bold text-base" style={{ fontFamily: 'Fraunces, serif', color: 'var(--text-primary)' }}>
            {MONTHS[month]} {year}
          </h3>
          <button onClick={next} className="w-8 h-8 rounded-lg flex items-center justify-center btn-ghost"><ChevronRight size={16} /></button>
        </div>

        {/* Day headers */}
        <div className="grid grid-cols-7 border-b" style={{ borderColor: 'var(--border)' }}>
          {DAYS.map(d => (
            <div key={d} className="py-2 text-center text-xs font-semibold uppercase tracking-wide" style={{ color: 'var(--text-muted)' }}>{d}</div>
          ))}
        </div>

        {/* Calendar grid */}
        <div className="grid grid-cols-7">
          {cells.map((day, i) => {
            const isToday = day === now.getDate() && month === now.getMonth() && year === now.getFullYear();
            const isSelected = day === selected;
            const dayEvents = day ? getEvents(day) : [];
            return (
              <div key={i}
                className="min-h-16 p-1.5 border-r border-b cursor-pointer transition-colors"
                style={{ borderColor: 'var(--border)', background: isSelected ? 'rgba(201,168,76,0.08)' : 'transparent' }}
                onClick={() => day && setSelected(isSelected ? null : day)}>
                {day && (
                  <>
                    <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-medium mb-1 ${isToday ? 'text-black' : ''}`}
                      style={{ background: isToday ? 'var(--gold)' : 'transparent', color: isToday ? '#1A1000' : 'var(--text-secondary)' }}>
                      {day}
                    </div>
                    <div className="flex flex-col gap-0.5">
                      {dayEvents.slice(0, 3).map((ev, j) => (
                        <div key={j} className="text-xs px-1 py-0.5 rounded truncate"
                          style={{ background: `${ev.color}20`, color: ev.color, fontSize: '10px' }}>
                          {ev.label}
                        </div>
                      ))}
                      {dayEvents.length > 3 && (
                        <span className="text-xs" style={{ color: 'var(--text-muted)', fontSize: '10px' }}>+{dayEvents.length - 3} more</span>
                      )}
                    </div>
                  </>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Selected day detail */}
      {selected && selectedEvents.length > 0 && (
        <div className="card p-4">
          <h3 className="font-semibold text-sm mb-3" style={{ color: 'var(--text-primary)' }}>
            {MONTHS[month]} {selected}
          </h3>
          <div className="flex flex-col gap-2">
            {selectedEvents.map((ev, i) => (
              <div key={i} className="flex items-center justify-between p-3 rounded-xl"
                style={{ background: `${ev.color}10`, border: `1px solid ${ev.color}30` }}>
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full" style={{ background: ev.color }} />
                  <span className="text-sm font-medium" style={{ color: 'var(--text-primary)' }}>{ev.label}</span>
                </div>
                {ev.amount && <span className="text-sm font-bold" style={{ color: ev.color }}>{fmt(ev.amount)}</span>}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
