import React from 'react';
import { Newspaper, TrendingUp, TrendingDown, Minus } from 'lucide-react';

export default function NewsCard({ article }) {
  const { title, source, publishedAt, sentiment, sentimentScore, summary, explanation, url } = article;

  const getSentimentBadge = (sent) => {
    switch (sent?.toUpperCase()) {
      case 'POSITIVE':
        return (
          <div style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '0.25rem',
            padding: '0.25rem 0.6rem',
            borderRadius: '4px',
            fontSize: '0.75rem',
            fontWeight: 600,
            backgroundColor: 'rgba(16, 185, 129, 0.1)',
            color: 'var(--color-green)',
            border: '1px solid rgba(16, 185, 129, 0.2)'
          }}>
            <TrendingUp size={12} />
            <span>Bullish</span>
          </div>
        );
      case 'NEGATIVE':
        return (
          <div style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '0.25rem',
            padding: '0.25rem 0.6rem',
            borderRadius: '4px',
            fontSize: '0.75rem',
            fontWeight: 600,
            backgroundColor: 'rgba(239, 68, 68, 0.1)',
            color: 'var(--color-red)',
            border: '1px solid rgba(239, 68, 68, 0.2)'
          }}>
            <TrendingDown size={12} />
            <span>Bearish</span>
          </div>
        );
      default:
        return (
          <div style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '0.25rem',
            padding: '0.25rem 0.6rem',
            borderRadius: '4px',
            fontSize: '0.75rem',
            fontWeight: 600,
            backgroundColor: 'rgba(156, 163, 175, 0.1)',
            color: 'var(--text-secondary)',
            border: '1px solid rgba(156, 163, 175, 0.2)'
          }}>
            <Minus size={12} />
            <span>Neutral</span>
          </div>
        );
    }
  };

  const getCardBorderColor = (sent) => {
    switch (sent?.toUpperCase()) {
      case 'POSITIVE':
        return 'rgba(16, 185, 129, 0.15)';
      case 'NEGATIVE':
        return 'rgba(239, 68, 68, 0.15)';
      default:
        return 'var(--border-glass)';
    }
  };

  const formattedDate = new Date(publishedAt).toLocaleDateString([], {
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });

  return (
    <div 
      className="glass-card" 
      style={{
        borderColor: getCardBorderColor(sentiment),
        display: 'flex',
        flexDirection: 'column',
        gap: '0.75rem',
        padding: '1.25rem',
        position: 'relative',
        overflow: 'hidden'
      }}
    >
      {/* Header Info */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.75rem', color: 'var(--text-muted)' }}>
          <Newspaper size={14} />
          <span>{source || 'Financial News'}</span>
          <span>•</span>
          <span>{formattedDate}</span>
        </div>
        <div>
          {getSentimentBadge(sentiment)}
        </div>
      </div>

      {/* Title */}
      <h4 style={{ 
        fontSize: '1rem', 
        fontWeight: 600, 
        lineHeight: 1.4,
        color: 'var(--text-primary)'
      }}>
        {url ? (
          <a href={url} target="_blank" rel="noopener noreferrer" style={{ color: 'inherit', textDecoration: 'none' }} className="hover:text-blue-400">
            {title}
          </a>
        ) : title}
      </h4>

      {/* Summary */}
      {summary && (
        <p style={{ 
          fontSize: '0.85rem', 
          color: 'var(--text-secondary)', 
          lineHeight: 1.5 
        }}>
          {summary}
        </p>
      )}

      {/* AI Sentiment Analysis explanation */}
      {explanation && (
        <div style={{
          marginTop: '0.5rem',
          padding: '0.75rem',
          backgroundColor: 'rgba(255, 255, 255, 0.02)',
          borderLeft: `2px solid ${sentiment?.toUpperCase() === 'POSITIVE' ? 'var(--color-green)' : (sentiment?.toUpperCase() === 'NEGATIVE' ? 'var(--color-red)' : 'var(--color-blue)')}`,
          borderRadius: '0 6px 6px 0',
          fontSize: '0.8rem',
        }}>
          <strong style={{ color: 'var(--text-primary)', display: 'block', marginBottom: '0.25rem' }}>AI Context Explanation:</strong>
          <span style={{ color: 'var(--text-secondary)', lineHeight: 1.4 }}>{explanation}</span>
        </div>
      )}
    </div>
  );
}
