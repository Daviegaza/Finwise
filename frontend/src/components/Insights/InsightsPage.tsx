import React from 'react';
import { AlertTriangle, CheckCircle, Lightbulb, Bell, RefreshCw, Sparkles, TrendingUp } from 'lucide-react';
import { useInsights } from '../../hooks';
import { Insight } from '../../types';

const INSIGHT_CONFIG = {
  warning: { icon: AlertTriangle, color: 'var(--warning)', bg: 'rgba(251,191,36,0.08)', border: 'rgba(251,191,36,0.2)', label: 'Warning' },
  success: { icon: CheckCircle, color: 'var(--success)', bg: 'rgba(52,211,153,0.08)', border: 'rgba(52,211,153,0.2)', label: 'Success' },
  tip: { icon: Lightbulb, color: 'var(--info)', bg: 'rgba(96,165,250,0.08)', border: 'rgba(96,165,250,0.2)', label: 'Tip' },
  alert: { icon: Bell, color: 'var(--danger)', bg: 'rgba(248,113,113,0.08)', border: 'rgba(248,113,113,0.2)', label: 'Alert' },
};

function InsightCard({ insight, delay = 0 }: { insight: Insight; delay?: number }) {
  const cfg = INSIGHT_CONFIG[insight.type];
  const Icon = cfg.icon;
  const priorityColors = { high: 'var(--danger)', medium: 'var(--warning)', low: 'var(--info)' };

  return (
    <div className="card p-5 animate-fade-slide-up flex gap-4" style={{ animationDelay: `${delay}s`, borderColor: cfg.border, background: cfg.bg }}>
      <div className="flex-shrink-0 w-10 h-10 rounded-xl flex items-center justify-center"
        style={{ background: `${cfg.color}18` }}>
        <Icon size={18} style={{ color: cfg.color }} />
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-start justify-between gap-2 mb-1.5 flex-wrap">
          <h3 className="font-semibold text-sm" style={{ color: 'var(--text-primary)' }}>{insight.title}</h3>
          <div className="flex items-center gap-1.5 flex-shrink-0">
            <span className="badge text-xs" style={{ background: `${priorityColors[insight.priority]}18`, color: priorityColors[insight.priority] }}>
              {insight.priority}
            </span>
            <span className="badge badge-gold text-xs">{cfg.label}</span>
          </div>
        </div>
        <p className="text-sm leading-relaxed" style={{ color: 'var(--text-secondary)' }}>{insight.message}</p>
        {insight.actionable && (
          <button className="mt-3 text-xs font-medium transition-colors"
            style={{ color: cfg.color }}>
            Take Action →
          </button>
        )}
      </div>
    </div>
  );
}

export default function InsightsPage() {
  const { insights, narrative, loading, refetch } = useInsights();

  const byPriority = {
    high: insights.filter(i => i.priority === 'high'),
    medium: insights.filter(i => i.priority === 'medium'),
    low: insights.filter(i => i.priority === 'low'),
  };

  return (
    <div className="flex flex-col gap-5">
      {/* Header */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <h2 className="section-title">Financial Insights</h2>
          <p className="section-subtitle">AI-powered analysis of your finances</p>
        </div>
        <button onClick={refetch} disabled={loading}
          className="btn-ghost p-2.5 rounded-xl flex items-center gap-2 text-xs">
          <RefreshCw size={14} className={loading ? 'animate-spin' : ''} />
          <span className="hidden sm:inline">Refresh</span>
        </button>
      </div>

      {/* AI Narrative Card */}
      <div className="card p-5 relative overflow-hidden animate-glow-pulse">
        <div className="absolute top-0 right-0 w-48 h-48 rounded-full opacity-5 -translate-y-1/4 translate-x-1/4"
          style={{ background: 'var(--gold)', filter: 'blur(40px)' }} />
        <div className="flex items-start gap-3">
          <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
            style={{ background: 'linear-gradient(135deg,#C9A84C,#E8C86D)' }}>
            <Sparkles size={18} style={{ color: '#1A1000' }} />
          </div>
          <div>
            <div className="flex items-center gap-2 mb-2">
              <p className="text-sm font-semibold gold-text">FinWise AI Analysis</p>
              <span className="badge badge-gold text-xs">Live</span>
            </div>
            {loading ? (
              <div className="flex flex-col gap-2">
                <div className="skeleton h-4 w-full" />
                <div className="skeleton h-4 w-4/5" />
              </div>
            ) : (
              <p className="text-sm leading-relaxed" style={{ color: 'var(--text-secondary)' }}>
                {narrative || "Loading your personalized financial analysis..."}
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-3 gap-3">
        {[
          { label: 'High Priority', count: byPriority.high.length, color: 'var(--danger)' },
          { label: 'Medium', count: byPriority.medium.length, color: 'var(--warning)' },
          { label: 'Tips', count: byPriority.low.length, color: 'var(--info)' },
        ].map(s => (
          <div key={s.label} className="card p-3 text-center">
            <p className="text-2xl font-bold" style={{ color: s.color, fontFamily: 'Fraunces, serif' }}>{s.count}</p>
            <p className="text-xs" style={{ color: 'var(--text-muted)' }}>{s.label}</p>
          </div>
        ))}
      </div>

      {/* Insights list */}
      {loading ? (
        <div className="flex flex-col gap-3">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="card p-5 flex gap-4">
              <div className="skeleton w-10 h-10 rounded-xl" />
              <div className="flex-1">
                <div className="skeleton h-4 w-48 mb-2" />
                <div className="skeleton h-3 w-full" />
                <div className="skeleton h-3 w-3/4 mt-1" />
              </div>
            </div>
          ))}
        </div>
      ) : insights.length === 0 ? (
        <div className="card p-12 text-center">
          <TrendingUp size={40} className="mx-auto mb-4" style={{ color: 'var(--text-muted)' }} />
          <p className="font-semibold mb-2" style={{ fontFamily: 'Fraunces, serif' }}>No insights yet</p>
          <p className="text-sm" style={{ color: 'var(--text-muted)' }}>Add more transactions to get personalized insights</p>
        </div>
      ) : (
        <div className="flex flex-col gap-3">
          {byPriority.high.length > 0 && (
            <>
              <p className="text-xs font-semibold uppercase tracking-wider px-1" style={{ color: 'var(--danger)' }}>
                🔴 Needs Attention
              </p>
              {byPriority.high.map((i, idx) => <InsightCard key={i.id} insight={i} delay={idx * 0.05} />)}
            </>
          )}
          {byPriority.medium.length > 0 && (
            <>
              <p className="text-xs font-semibold uppercase tracking-wider px-1 mt-2" style={{ color: 'var(--warning)' }}>
                🟡 Worth Noting
              </p>
              {byPriority.medium.map((i, idx) => <InsightCard key={i.id} insight={i} delay={idx * 0.05} />)}
            </>
          )}
          {byPriority.low.length > 0 && (
            <>
              <p className="text-xs font-semibold uppercase tracking-wider px-1 mt-2" style={{ color: 'var(--info)' }}>
                💡 Tips & Suggestions
              </p>
              {byPriority.low.map((i, idx) => <InsightCard key={i.id} insight={i} delay={idx * 0.05} />)}
            </>
          )}
        </div>
      )}
    </div>
  );
}
