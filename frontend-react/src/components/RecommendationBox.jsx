import React from 'react';
import { ThumbsUp, HelpCircle, AlertTriangle, ChevronRight } from 'lucide-react';

export default function RecommendationBox({ recommendation }) {
  if (!recommendation) {
    return (
      <div className="glass-card" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '150px' }}>
        <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>No recommendation calculations available.</p>
      </div>
    );
  }

  const { symbol, rating, confidence, sentimentScore, technicalScore, reasoning } = recommendation;

  const getRatingTheme = (rate) => {
    switch (rate?.toUpperCase()) {
      case 'BUY':
      case 'STRONG BUY':
        return {
          label: 'BUY',
          color: 'var(--color-green)',
          bgColor: 'rgba(16, 185, 129, 0.1)',
          borderColor: 'rgba(16, 185, 129, 0.25)',
          Icon: ThumbsUp,
        };
      case 'SELL':
      case 'STRONG SELL':
        return {
          label: 'SELL',
          color: 'var(--color-red)',
          bgColor: 'rgba(239, 68, 68, 0.1)',
          borderColor: 'rgba(239, 68, 68, 0.25)',
          Icon: AlertTriangle,
        };
      default:
        return {
          label: 'HOLD',
          color: 'var(--color-orange)',
          bgColor: 'rgba(245, 158, 11, 0.1)',
          borderColor: 'rgba(245, 158, 11, 0.25)',
          Icon: HelpCircle,
        };
    }
  };

  const theme = getRatingTheme(rating);
  const RatingIcon = theme.Icon;

  return (
    <div className="glass-card" style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
      {/* Upper header segment */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h3 style={{ fontSize: '1rem', fontWeight: 600 }}>AI Consensus & Signals</h3>
          <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Multi-factor scoring algorithm rating recommendation</p>
        </div>
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '0.5rem',
          padding: '0.5rem 1rem',
          backgroundColor: theme.bgColor,
          border: `1px solid ${theme.borderColor}`,
          borderRadius: '8px',
          color: theme.color,
          fontSize: '1rem',
          fontWeight: 700,
        }}>
          <RatingIcon size={18} />
          <span>{theme.label}</span>
        </div>
      </div>

      {/* Metric scores progress bars */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
        {/* Technical Score */}
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', marginBottom: '0.35rem' }}>
            <span style={{ color: 'var(--text-secondary)' }}>Technical Momentum Score</span>
            <strong style={{ color: 'var(--text-primary)' }}>{(technicalScore * 100).toFixed(0)}%</strong>
          </div>
          <div style={{ width: '100%', height: '6px', backgroundColor: 'rgba(255, 255, 255, 0.05)', borderRadius: '3px', overflow: 'hidden' }}>
            <div style={{
              width: `${technicalScore * 100}%`,
              height: '100%',
              background: 'linear-gradient(90deg, #3b82f6, #60a5fa)',
              borderRadius: '3px'
            }}></div>
          </div>
        </div>

        {/* News Sentiment Score */}
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', marginBottom: '0.35rem' }}>
            <span style={{ color: 'var(--text-secondary)' }}>News Sentiment Consensus</span>
            <strong style={{ color: 'var(--text-primary)' }}>{(sentimentScore * 100).toFixed(0)}%</strong>
          </div>
          <div style={{ width: '100%', height: '6px', backgroundColor: 'rgba(255, 255, 255, 0.05)', borderRadius: '3px', overflow: 'hidden' }}>
            <div style={{
              width: `${sentimentScore * 100}%`,
              height: '100%',
              background: 'linear-gradient(90deg, #10b981, #34d399)',
              borderRadius: '3px'
            }}></div>
          </div>
        </div>

        {/* Recommendation Confidence */}
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', marginBottom: '0.35rem' }}>
            <span style={{ color: 'var(--text-secondary)' }}>AI Consensus Confidence</span>
            <strong style={{ color: 'var(--text-primary)' }}>{(confidence * 100).toFixed(0)}%</strong>
          </div>
          <div style={{ width: '100%', height: '6px', backgroundColor: 'rgba(255, 255, 255, 0.05)', borderRadius: '3px', overflow: 'hidden' }}>
            <div style={{
              width: `${confidence * 100}%`,
              height: '100%',
              background: `linear-gradient(90deg, ${theme.color}, ${theme.color})`,
              borderRadius: '3px'
            }}></div>
          </div>
        </div>
      </div>

      {/* Visual core explanation summary */}
      {reasoning && (
        <div style={{
          marginTop: '0.25rem',
          padding: '1rem',
          backgroundColor: 'rgba(255, 255, 255, 0.02)',
          border: '1px solid var(--border-glass)',
          borderRadius: '8px',
        }}>
          <span style={{
            fontSize: '0.75rem',
            color: 'var(--text-muted)',
            textTransform: 'uppercase',
            fontWeight: 600,
            display: 'block',
            letterSpacing: '0.5px',
            marginBottom: '0.5rem',
          }}>
            AI Reasoning & Explanation
          </span>
          <p style={{
            fontSize: '0.85rem',
            color: 'var(--text-secondary)',
            lineHeight: 1.5,
          }}>
            {reasoning}
          </p>
        </div>
      )}
    </div>
  );
}
