import React, { useState, useRef, useEffect } from 'react';
import { Send, Bot, User, Trash2, Sparkles, RefreshCw, TrendingUp, PieChart, Target, DollarSign } from 'lucide-react';
import { useAIChat } from '../../hooks';
import { AIMessage } from '../../types';

const QUICK_PROMPTS = [
  { icon: TrendingUp, text: "How can I improve my savings rate?" },
  { icon: PieChart, text: "Analyze my spending patterns this month" },
  { icon: Target, text: "Am I on track to meet my financial goals?" },
  { icon: DollarSign, text: "What investments should I consider?" },
];

function MessageBubble({ message }: { message: AIMessage }) {
  const isAI = message.role === 'assistant';
  const time = new Date(message.timestamp).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });

  return (
    <div className={`flex gap-3 animate-fade-slide-up ${isAI ? 'flex-row' : 'flex-row-reverse'}`}>
      {/* Avatar */}
      <div className="flex-shrink-0 w-8 h-8 rounded-xl flex items-center justify-center"
        style={{ background: isAI ? 'linear-gradient(135deg,#C9A84C,#E8C86D)' : 'rgba(255,255,255,0.08)' }}>
        {isAI ? <Bot size={16} style={{ color: '#1A1000' }} /> : <User size={16} style={{ color: 'var(--text-secondary)' }} />}
      </div>

      {/* Bubble */}
      <div className={`flex flex-col gap-1 max-w-[80%] lg:max-w-[70%] ${isAI ? 'items-start' : 'items-end'}`}>
        <div className="px-4 py-3 rounded-2xl text-sm leading-relaxed"
          style={{
            background: isAI ? 'var(--bg-card)' : 'rgba(201,168,76,0.15)',
            border: `1px solid ${isAI ? 'var(--border)' : 'rgba(201,168,76,0.3)'}`,
            color: 'var(--text-primary)',
            borderTopLeftRadius: isAI ? '4px' : '18px',
            borderTopRightRadius: isAI ? '18px' : '4px',
          }}>
          {message.content.split('\n').map((line, i) => (
            <span key={i}>
              {line}
              {i < message.content.split('\n').length - 1 && <br />}
            </span>
          ))}
        </div>
        <span className="text-xs px-1" style={{ color: 'var(--text-muted)' }}>{time}</span>
      </div>
    </div>
  );
}

function TypingIndicator() {
  return (
    <div className="flex gap-3 animate-fade-slide-up">
      <div className="flex-shrink-0 w-8 h-8 rounded-xl flex items-center justify-center"
        style={{ background: 'linear-gradient(135deg,#C9A84C,#E8C86D)' }}>
        <Bot size={16} style={{ color: '#1A1000' }} />
      </div>
      <div className="px-4 py-3 rounded-2xl flex items-center gap-1.5 rounded-tl-sm"
        style={{ background: 'var(--bg-card)', border: '1px solid var(--border)' }}>
        {[0, 1, 2].map(i => (
          <div key={i} className="w-1.5 h-1.5 rounded-full animate-bounce"
            style={{ background: 'var(--gold)', animationDelay: `${i * 0.15}s` }} />
        ))}
      </div>
    </div>
  );
}

export default function AIAdvisor() {
  const { messages, loading, error, sendMessage, clearChat } = useAIChat();
  const [input, setInput] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, loading]);

  const handleSend = () => {
    if (!input.trim() || loading) return;
    sendMessage(input.trim());
    setInput('');
    if (textareaRef.current) textareaRef.current.style.height = 'auto';
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleTextareaChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setInput(e.target.value);
    e.target.style.height = 'auto';
    e.target.style.height = `${Math.min(e.target.scrollHeight, 120)}px`;
  };

  return (
    <div className="flex flex-col h-full" style={{ height: 'calc(100vh - 120px)' }}>
      {/* Header */}
      <div className="flex items-center justify-between mb-4 flex-shrink-0">
        <div>
          <h2 className="section-title flex items-center gap-2">
            <Sparkles size={20} style={{ color: 'var(--gold)' }} />
            AI Financial Advisor
          </h2>
          <p className="section-subtitle">Powered by Claude AI · Personalized to your finances</p>
        </div>
        <button onClick={clearChat} className="btn-ghost p-2 rounded-lg flex items-center gap-2 text-xs">
          <Trash2 size={14} />
          <span className="hidden sm:inline">Clear</span>
        </button>
      </div>

      {/* Quick prompts */}
      {messages.length <= 1 && (
        <div className="grid grid-cols-2 gap-2 mb-4 flex-shrink-0">
          {QUICK_PROMPTS.map(({ icon: Icon, text }) => (
            <button
              key={text}
              onClick={() => sendMessage(text)}
              className="flex items-start gap-2 p-3 rounded-xl text-left text-xs transition-all duration-200 border"
              style={{
                background: 'var(--bg-card)', borderColor: 'var(--border)',
                color: 'var(--text-secondary)',
              }}
              onMouseEnter={e => {
                (e.currentTarget as HTMLElement).style.borderColor = 'var(--border-hover)';
                (e.currentTarget as HTMLElement).style.color = 'var(--gold)';
              }}
              onMouseLeave={e => {
                (e.currentTarget as HTMLElement).style.borderColor = 'var(--border)';
                (e.currentTarget as HTMLElement).style.color = 'var(--text-secondary)';
              }}
            >
              <Icon size={14} style={{ color: 'var(--gold)', flexShrink: 0, marginTop: 1 }} />
              {text}
            </button>
          ))}
        </div>
      )}

      {/* Messages */}
      <div className="flex-1 overflow-y-auto scroll-container flex flex-col gap-4 pr-1">
        {messages.map((msg, i) => (
          <MessageBubble key={i} message={msg} />
        ))}
        {loading && <TypingIndicator />}
        {error && (
          <div className="flex items-center gap-2 p-3 rounded-xl text-sm"
            style={{ background: 'rgba(248,113,113,0.1)', border: '1px solid rgba(248,113,113,0.2)', color: 'var(--danger)' }}>
            <RefreshCw size={14} />
            {error}
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className="flex-shrink-0 mt-4">
        <div className="flex items-end gap-3 p-3 rounded-2xl border"
          style={{ background: 'var(--bg-card)', borderColor: 'var(--border)' }}>
          <textarea
            ref={textareaRef}
            value={input}
            onChange={handleTextareaChange}
            onKeyDown={handleKeyDown}
            placeholder="Ask me anything about your finances..."
            rows={1}
            className="flex-1 bg-transparent outline-none resize-none text-sm leading-relaxed"
            style={{ color: 'var(--text-primary)', fontFamily: 'Sora, sans-serif', maxHeight: 120 }}
          />
          <button
            onClick={handleSend}
            disabled={!input.trim() || loading}
            className="flex-shrink-0 w-9 h-9 rounded-xl flex items-center justify-center transition-all duration-200 disabled:opacity-40"
            style={{ background: input.trim() && !loading ? 'linear-gradient(135deg,#C9A84C,#E8C86D)' : 'rgba(255,255,255,0.08)' }}
          >
            <Send size={15} style={{ color: input.trim() && !loading ? '#1A1000' : 'var(--text-muted)' }} />
          </button>
        </div>
        <p className="text-xs text-center mt-2" style={{ color: 'var(--text-muted)' }}>
          AI advice is for informational purposes. Not a substitute for professional financial counsel.
        </p>
      </div>
    </div>
  );
}
