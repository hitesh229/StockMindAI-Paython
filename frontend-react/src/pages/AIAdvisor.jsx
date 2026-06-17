import React from 'react';
import { Bot, Sparkles, Shield, Cpu, HelpCircle } from 'lucide-react';
import AIChatBox from '../components/AIChatBox';

export default function AIAdvisor({ user }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', paddingBottom: '3rem' }}>
      
      {/* Header Info */}
      <div style={{
        borderBottom: '1px solid var(--border-glass)',
        paddingBottom: '1rem'
      }}>
        <h2 style={{ fontSize: '1.35rem', fontWeight: 700 }}>AI Advisor Terminal</h2>
        <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Augmented prompt generation (RAG) referencing live stock indicators, news sentiment, and risk appetite parameters</p>
      </div>

      <div className="dashboard-grid">
        
        {/* Core Chat Terminal (Col 8) */}
        <div style={{ gridColumn: 'span 8' }}>
          <AIChatBox />
        </div>

        {/* Cognitive Context Meta Info (Col 4) */}
        <div style={{ gridColumn: 'span 4', display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          
          {/* Active Context Board */}
          <div className="glass-card glow-blue" style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--color-blue)' }}>
              <Cpu size={18} />
              <h3 style={{ fontSize: '0.9rem', fontWeight: 600 }}>Active RAG Directives</h3>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
              <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'flex-start' }}>
                <Shield size={14} style={{ color: 'var(--color-green)', flexShrink: 0, marginTop: '2px' }} />
                <span>
                  <strong>Risk Appetite:</strong> The advisor automatically trims recommendations to match your profile (<strong>{user.riskAppetite}</strong> risk profile).
                </span>
              </div>
              <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'flex-start' }}>
                <Sparkles size={14} style={{ color: 'var(--color-orange)', flexShrink: 0, marginTop: '2px' }} />
                <span>
                  <strong>Database Memory:</strong> All active holdings, watchlists, and technical indicators are injected into the cognitive reasoning prompts.
                </span>
              </div>
            </div>
          </div>

          {/* Quick FAQ / Prompt Help */}
          <div className="glass-card">
            <h3 style={{ fontSize: '0.9rem', fontWeight: 600, marginBottom: '0.75rem' }}>Financial Guidance Help</h3>
            <ul style={{ 
              fontSize: '0.75rem', 
              color: 'var(--text-secondary)', 
              display: 'flex', 
              flexDirection: 'column', 
              gap: '0.65rem',
              paddingLeft: '1rem',
              lineHeight: 1.45
            }}>
              <li>Ask the chatbot to explain technical signals like RSI and MACD in plain English.</li>
              <li>Inquire why specific stock assets are making sudden bullish breakouts.</li>
              <li>Evaluate if your current sector weighting allocations are healthy or over-concentrated.</li>
              <li>Draft BUY/HOLD/SELL strategies matching your specific investment goals.</li>
            </ul>
          </div>

        </div>

      </div>

    </div>
  );
}
