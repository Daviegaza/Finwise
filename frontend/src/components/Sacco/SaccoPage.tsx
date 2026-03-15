import React, { useState, useMemo } from 'react';
import { Building2, Calculator, TrendingUp, Info } from 'lucide-react';
import { getCurrencySymbol } from '../../utils/currency';

export default function SaccoPage() {
  const sym = getCurrencySymbol();
  const fmt = (n: number) => `${sym} ${Math.abs(n).toLocaleString('en-KE', { maximumFractionDigits: 0 })}`;

  const [contributions, setContributions] = useState(50000);
  const [monthly, setMonthly] = useState(5000);
  const [months, setMonths] = useState(12);
  const [loanAmount, setLoanAmount] = useState(150000);
  const [repayMonths, setRepayMonths] = useState(24);
  const [rate, setRate] = useState(12);
  const [dividendRate, setDividendRate] = useState(10);

  const result = useMemo(() => {
    // Most SACCOs lend 3x contributions
    const maxLoan = contributions * 3;
    const canBorrow = loanAmount <= maxLoan;
    // Monthly reducing balance interest
    const monthlyRate = rate / 100 / 12;
    const payment = monthlyRate > 0
      ? loanAmount * (monthlyRate * Math.pow(1 + monthlyRate, repayMonths)) / (Math.pow(1 + monthlyRate, repayMonths) - 1)
      : loanAmount / repayMonths;
    const totalRepay = payment * repayMonths;
    const totalInterest = totalRepay - loanAmount;
    // Savings projection
    const futureContrib = contributions + monthly * months;
    const dividend = futureContrib * (dividendRate / 100);
    return { maxLoan, canBorrow, payment, totalRepay, totalInterest, futureContrib, dividend };
  }, [contributions, monthly, months, loanAmount, repayMonths, rate, dividendRate]);

  return (
    <div className="flex flex-col gap-4">
      <div>
        <h2 className="section-title">SACCO Calculator</h2>
        <p className="section-subtitle">Calculate loan eligibility, repayments and dividend projections</p>
      </div>

      <div className="grid sm:grid-cols-2 gap-4">
        {/* Inputs */}
        <div className="flex flex-col gap-4">
          <div className="card p-5">
            <div className="flex items-center gap-2 mb-4">
              <Building2 size={16} style={{ color: 'var(--gold)' }} />
              <h3 className="font-semibold text-sm" style={{ color: 'var(--text-primary)' }}>Your SACCO Details</h3>
            </div>
            <div className="flex flex-col gap-3">
              <div>
                <div className="flex justify-between mb-1">
                  <label className="label">Current Contributions</label>
                  <span className="text-xs font-bold" style={{ color: 'var(--gold)' }}>{fmt(contributions)}</span>
                </div>
                <input type="range" min="5000" max="1000000" step="5000" value={contributions} onChange={e => setContributions(+e.target.value)} className="w-full" />
              </div>
              <div>
                <div className="flex justify-between mb-1">
                  <label className="label">Monthly Contribution</label>
                  <span className="text-xs font-bold" style={{ color: 'var(--gold)' }}>{fmt(monthly)}</span>
                </div>
                <input type="range" min="500" max="50000" step="500" value={monthly} onChange={e => setMonthly(+e.target.value)} className="w-full" />
              </div>
              <div>
                <div className="flex justify-between mb-1">
                  <label className="label">Months Contributing</label>
                  <span className="text-xs font-bold" style={{ color: 'var(--gold)' }}>{months} months</span>
                </div>
                <input type="range" min="1" max="60" step="1" value={months} onChange={e => setMonths(+e.target.value)} className="w-full" />
              </div>
              <div>
                <div className="flex justify-between mb-1">
                  <label className="label">Annual Dividend Rate</label>
                  <span className="text-xs font-bold" style={{ color: 'var(--gold)' }}>{dividendRate}%</span>
                </div>
                <input type="range" min="5" max="20" step="0.5" value={dividendRate} onChange={e => setDividendRate(+e.target.value)} className="w-full" />
              </div>
            </div>
          </div>

          <div className="card p-5">
            <div className="flex items-center gap-2 mb-4">
              <Calculator size={16} style={{ color: 'var(--info)' }} />
              <h3 className="font-semibold text-sm" style={{ color: 'var(--text-primary)' }}>Loan Calculator</h3>
            </div>
            <div className="flex flex-col gap-3">
              <div>
                <div className="flex justify-between mb-1">
                  <label className="label">Loan Amount</label>
                  <span className="text-xs font-bold" style={{ color: result.canBorrow ? 'var(--success)' : 'var(--danger)' }}>{fmt(loanAmount)}</span>
                </div>
                <input type="range" min="10000" max="3000000" step="10000" value={loanAmount} onChange={e => setLoanAmount(+e.target.value)} className="w-full" />
                <p className="text-xs mt-1" style={{ color: result.canBorrow ? 'var(--success)' : 'var(--danger)' }}>
                  {result.canBorrow ? `✓ Within your limit of ${fmt(result.maxLoan)}` : `✗ Exceeds limit of ${fmt(result.maxLoan)} (3× contributions)`}
                </p>
              </div>
              <div>
                <div className="flex justify-between mb-1">
                  <label className="label">Repayment Period</label>
                  <span className="text-xs font-bold" style={{ color: 'var(--gold)' }}>{repayMonths} months</span>
                </div>
                <input type="range" min="3" max="60" step="3" value={repayMonths} onChange={e => setRepayMonths(+e.target.value)} className="w-full" />
              </div>
              <div>
                <div className="flex justify-between mb-1">
                  <label className="label">Annual Interest Rate</label>
                  <span className="text-xs font-bold" style={{ color: 'var(--gold)' }}>{rate}%</span>
                </div>
                <input type="range" min="8" max="24" step="0.5" value={rate} onChange={e => setRate(+e.target.value)} className="w-full" />
              </div>
            </div>
          </div>
        </div>

        {/* Results */}
        <div className="flex flex-col gap-4">
          <div className="card p-5" style={{ background: result.canBorrow ? 'rgba(52,211,153,0.04)' : 'rgba(248,113,113,0.04)', borderColor: result.canBorrow ? 'rgba(52,211,153,0.2)' : 'rgba(248,113,113,0.2)' }}>
            <div className="flex items-center gap-2 mb-4">
              <TrendingUp size={16} style={{ color: result.canBorrow ? 'var(--success)' : 'var(--danger)' }} />
              <h3 className="font-semibold text-sm" style={{ color: 'var(--text-primary)' }}>Loan Results</h3>
            </div>
            <div className="flex flex-col gap-3">
              {[
                { label: 'Max Eligible Loan', val: fmt(result.maxLoan), color: 'var(--success)' },
                { label: 'Monthly Repayment', val: fmt(result.payment), color: result.canBorrow ? 'var(--text-primary)' : 'var(--danger)' },
                { label: 'Total Repayment', val: fmt(result.totalRepay), color: 'var(--text-primary)' },
                { label: 'Total Interest Cost', val: fmt(result.totalInterest), color: 'var(--danger)' },
              ].map(r => (
                <div key={r.label} className="flex justify-between items-center py-2 border-b" style={{ borderColor: 'var(--border)' }}>
                  <span className="text-sm" style={{ color: 'var(--text-muted)' }}>{r.label}</span>
                  <span className="font-bold text-sm" style={{ color: r.color }}>{r.val}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="card p-5" style={{ background: 'rgba(201,168,76,0.04)', borderColor: 'rgba(201,168,76,0.2)' }}>
            <div className="flex items-center gap-2 mb-4">
              <TrendingUp size={16} style={{ color: 'var(--gold)' }} />
              <h3 className="font-semibold text-sm" style={{ color: 'var(--text-primary)' }}>Savings Projection</h3>
            </div>
            <div className="flex flex-col gap-3">
              {[
                { label: `Savings in ${months} months`, val: fmt(result.futureContrib), color: 'var(--gold)' },
                { label: `Annual Dividend (${dividendRate}%)`, val: fmt(result.dividend), color: 'var(--success)' },
                { label: 'Total with Dividends', val: fmt(result.futureContrib + result.dividend), color: 'var(--gold)' },
              ].map(r => (
                <div key={r.label} className="flex justify-between items-center py-2 border-b" style={{ borderColor: 'var(--border)' }}>
                  <span className="text-sm" style={{ color: 'var(--text-muted)' }}>{r.label}</span>
                  <span className="font-bold text-sm" style={{ color: r.color }}>{r.val}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="card p-4 flex items-start gap-3" style={{ background: 'rgba(96,165,250,0.04)', borderColor: 'rgba(96,165,250,0.2)' }}>
            <Info size={14} style={{ color: 'var(--info)', flexShrink: 0, marginTop: 2 }} />
            <p className="text-xs" style={{ color: 'var(--text-muted)' }}>
              Most Kenyan SACCOs lend 3× contributions. Interest is calculated on a reducing balance. Rates vary by SACCO — check with your SACCO for exact terms.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
