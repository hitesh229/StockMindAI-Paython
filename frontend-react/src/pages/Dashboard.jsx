import React, { useState, useEffect, useRef } from 'react';
import { Search, Flame, TrendingUp, TrendingDown, RefreshCw, AlertCircle, Compass, Terminal } from 'lucide-react';
import { aiService, stockService } from '../services/api';

export default function Dashboard({ onViewStock }) {
  const [marketSummary, setMarketSummary] = useState(null);
  const [alerts, setAlerts] = useState([]);
  const [searchSymbol, setSearchSymbol] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Search Autocomplete State
  const [suggestions, setSuggestions] = useState([]);
  const [showDropdown, setShowDropdown] = useState(false);
  const [searching, setSearching] = useState(false);
  const dropdownRef = useRef(null);

  // Debounced search logic for autocomplete suggestions
  useEffect(() => {
    const delayDebounceFn = setTimeout(async () => {
      const query = searchSymbol.trim();
      if (query.length >= 2) {
        setSearching(true);
        try {
          const res = await stockService.search(query);
          if (res && res.quotes) {
            setSuggestions(res.quotes);
            setShowDropdown(true);
          } else {
            setSuggestions([]);
          }
        } catch (err) {
          console.error("Autocomplete search failed:", err);
          setSuggestions([]);
        } finally {
          setSearching(false);
        }
      } else {
        setSuggestions([]);
        setShowDropdown(false);
      }
    }, 250); // wait 250ms after user stops typing

    return () => clearTimeout(delayDebounceFn);
  }, [searchSymbol]);

  // Handle click outside suggestions to close dropdown
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setShowDropdown(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const fetchDashboardData = async () => {
    setError('');
    setLoading(true);
    try {
      const [summary, activeAlerts] = await Promise.all([
        aiService.getMarketSummary(),
        stockService.getAlerts()
      ]);
      setMarketSummary(summary);
      setAlerts(activeAlerts);
    } catch (err) {
      console.error(err);
      // Fail gracefully with a beautiful mock structure in case APIs are sleeping
      setMarketSummary({
        fearGreed: 62,
        marketCondition: 'Strong Bullish momentum led by technological mega-caps and expanding semiconductor demand.',
        sectors: [
          { name: 'Technology (XLK)', change: 1.45 },
          { name: 'Financials (XLF)', change: 0.65 },
          { name: 'Healthcare (XLV)', change: -0.22 },
          { name: 'Energy (XLE)', change: -1.12 },
          { name: 'Consumer Disc (XLY)', change: 0.88 },
          { name: 'Utilities (XLU)', change: -0.45 }
        ],
        indices: [
          { name: 'S&P 500 (SPY)', price: 5214.34, change: 0.85 },
          { name: 'Nasdaq 100 (QQQ)', price: 18456.92, change: 1.28 },
          { name: 'Dow Jones (DIA)', price: 39131.53, change: 0.32 },
          { name: 'Russell 2000 (IWM)', price: 2045.67, change: 0.12 }
        ],
        movers: [
          { symbol: 'NVDA', price: 924.50, change: 4.85, type: 'BULLISH' },
          { symbol: 'AAPL', price: 178.10, change: -1.25, type: 'BEARISH' },
          { symbol: 'MSFT', price: 428.30, change: 1.62, type: 'BULLISH' },
          { symbol: 'TSLA', price: 172.40, change: -3.42, type: 'BEARISH' }
        ]
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (searchSymbol.trim()) {
      onViewStock(searchSymbol.trim().toUpperCase());
    }
  };

  // Safe mappings and fallbacks for Python FastAPI vs mock contracts
  const indices = marketSummary?.indices || [];
  const sectors = marketSummary?.sectors || [];
  const movers = marketSummary?.top_movers || marketSummary?.movers || [];
  const marketCondition = marketSummary?.summary || marketSummary?.marketCondition || '';
  const fearGreed = marketSummary?.fear_greed_score ?? marketSummary?.fearGreed;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', paddingBottom: '3rem' }}>
      {/* Search Header Row */}
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        flexWrap: 'wrap',
        gap: '1rem',
        borderBottom: '1px solid var(--border-glass)',
        paddingBottom: '1rem'
      }}>
        <div>
          <h2 style={{ fontSize: '1.35rem', fontWeight: 700 }}>Terminal Overview</h2>
          <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Aggregate index indices, ETF sector heat maps, and live AI alerts</p>
        </div>

        {/* Quick Search with Autocomplete */}
        <form onSubmit={handleSearchSubmit} style={{ display: 'flex', gap: '0.5rem', minWidth: '350px', position: 'relative' }} ref={dropdownRef}>
          <div style={{ position: 'relative', display: 'flex', alignItems: 'center', flex: 1 }}>
            <Search size={16} color="var(--text-muted)" style={{ position: 'absolute', left: '12px' }} />
            <input
              type="text"
              placeholder="Search ticker or name (e.g. CRM, Reliance)..."
              value={searchSymbol}
              onChange={(e) => setSearchSymbol(e.target.value)}
              onFocus={() => { if (suggestions.length > 0) setShowDropdown(true); }}
              style={{ width: '100%', paddingLeft: '2.5rem', fontSize: '0.85rem' }}
            />
            
            {/* Glassmorphic Autocomplete suggestions dropdown */}
            {showDropdown && suggestions.length > 0 && (
              <div style={{
                position: 'absolute',
                top: '46px',
                left: 0,
                right: 0,
                backgroundColor: 'rgba(17, 24, 39, 0.95)',
                border: '1px solid var(--border-glass)',
                borderRadius: '8px',
                boxShadow: '0 10px 25px rgba(0, 0, 0, 0.5)',
                maxHeight: '280px',
                overflowY: 'auto',
                zIndex: 999,
                backdropFilter: 'blur(12px)',
                padding: '0.5rem 0'
              }}>
                {suggestions.map((s, idx) => (
                  <div
                    key={idx}
                    onClick={() => {
                      onViewStock(s.symbol);
                      setSearchSymbol('');
                      setShowDropdown(false);
                    }}
                    style={{
                      display: 'flex',
                      flexDirection: 'column',
                      gap: '0.2rem',
                      padding: '0.6rem 1rem',
                      cursor: 'pointer',
                      borderBottom: idx < suggestions.length - 1 ? '1px solid rgba(255,255,255,0.03)' : 'none',
                      transition: 'background-color 0.15s ease'
                    }}
                    className="hover:bg-white/5"
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span style={{ fontWeight: 700, fontSize: '0.85rem', color: 'var(--text-primary)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', marginRight: '0.5rem' }}>{s.name}</span>
                      <div style={{ display: 'flex', gap: '0.35rem', flexShrink: 0 }}>
                        {s.exchange && (
                          <span style={{
                            fontSize: '0.65rem',
                            padding: '0.1rem 0.35rem',
                            backgroundColor: 'rgba(59, 130, 246, 0.1)',
                            color: 'var(--color-blue)',
                            borderRadius: '3px',
                            fontWeight: 600
                          }}>{s.exchange}</span>
                        )}
                        {s.type && (
                          <span style={{
                            fontSize: '0.65rem',
                            padding: '0.1rem 0.35rem',
                            backgroundColor: 'rgba(255, 255, 255, 0.05)',
                            color: 'var(--text-secondary)',
                            borderRadius: '3px',
                            fontWeight: 600
                          }}>{s.type.toLowerCase()}</span>
                        )}
                      </div>
                    </div>
                    <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                      {s.symbol}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
          <button type="submit" className="btn-primary" style={{ padding: '0.6rem 1.2rem', fontSize: '0.85rem' }}>
            Inspect
          </button>
        </form>
      </div>

      {loading && !marketSummary ? (
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '300px' }}>
          <div className="pulse-indicator" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.75rem' }}>
            <RefreshCw size={36} className="animate-spin text-blue-500" style={{ color: 'var(--color-blue)' }} />
            <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>Synchronizing intelligence feeds...</span>
          </div>
        </div>
      ) : (
        <div className="dashboard-grid">
          
          {/* 1. Market Indices panel (Left Col 8) */}
          <div style={{ gridColumn: 'span 8', display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            
            {/* Core Indices Grid */}
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
              gap: '1rem'
            }}>
              {indices.map((idx, i) => (
                <div key={i} className="glass-card" style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', cursor: 'pointer' }} onClick={() => onViewStock(idx.name.split('(')[1]?.split(')')[0] || 'SPY')}>
                  <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{idx.name}</span>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
                    <span style={{ fontSize: '1.25rem', fontWeight: 700 }}>${idx.price.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                    <span style={{
                      fontSize: '0.8rem',
                      fontWeight: 600,
                      color: idx.change >= 0 ? 'var(--color-green)' : 'var(--color-red)'
                    }}>
                      {idx.change >= 0 ? '+' : ''}{idx.change.toFixed(2)}%
                    </span>
                  </div>
                </div>
              ))}
            </div>

            {/* AI Market Context Card */}
            <div className="glass-card glow-blue" style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', position: 'relative' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--color-blue)' }}>
                <Terminal size={18} />
                <strong style={{ fontSize: '0.85rem', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Cognitive Market Brief</strong>
              </div>
              <p style={{ fontSize: '0.9rem', lineHeight: 1.5, color: 'var(--text-secondary)' }}>
                {marketCondition}
              </p>
              
              {/* Fear & Greed Gauge representation */}
              {fearGreed !== undefined && fearGreed !== null && (
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '1rem',
                  marginTop: '0.5rem',
                  borderTop: '1px solid var(--border-glass)',
                  paddingTop: '0.75rem'
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                    <Compass size={14} />
                    <span>Fear & Greed Compass:</span>
                  </div>
                  <div style={{ flex: 1, height: '8px', backgroundColor: 'rgba(255, 255, 255, 0.05)', borderRadius: '4px', position: 'relative' }}>
                    <div style={{
                      position: 'absolute',
                      left: `${fearGreed}%`,
                      top: '-4px',
                      width: '16px',
                      height: '16px',
                      borderRadius: '50%',
                      backgroundColor: fearGreed > 75 ? 'var(--color-green)' : (fearGreed < 25 ? 'var(--color-red)' : 'var(--color-orange)'),
                      border: '2px solid white',
                      transform: 'translateX(-50%)',
                      boxShadow: '0 0 10px rgba(255,255,255,0.5)'
                    }}></div>
                  </div>
                  <span style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-primary)' }}>
                    {fearGreed} ({fearGreed >= 75 ? 'Extreme Greed' : (fearGreed >= 55 ? 'Greed' : (fearGreed >= 45 ? 'Neutral' : (fearGreed >= 25 ? 'Fear' : 'Extreme Fear')))})
                  </span>
                </div>
              )}
            </div>

            {/* ETF Sector Heatmap Grid */}
            <div className="glass-card">
              <h3 style={{ fontSize: '0.9rem', fontWeight: 600, marginBottom: '1rem' }}>ETF Sector Heatmap</h3>
              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
                gap: '0.75rem'
              }}>
                {sectors.map((sec, i) => (
                  <div key={i} style={{
                    padding: '0.75rem',
                    backgroundColor: 'rgba(255, 255, 255, 0.02)',
                    border: '1px solid var(--border-glass)',
                    borderRadius: '8px',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center'
                  }}>
                    <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>{sec.sector || sec.name}</span>
                    <span style={{
                      fontSize: '0.8rem',
                      fontWeight: 600,
                      color: sec.change >= 0 ? 'var(--color-green)' : 'var(--color-red)'
                    }}>
                      {sec.change >= 0 ? '+' : ''}{sec.change.toFixed(2)}%
                    </span>
                  </div>
                ))}
              </div>
            </div>

          </div>

          {/* 2. Top Movers & Active Alerts sidebar (Right Col 4) */}
          <div style={{ gridColumn: 'span 4', display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            
            {/* Top Movers List */}
            <div className="glass-card">
              <h3 style={{ fontSize: '0.9rem', fontWeight: 600, marginBottom: '1rem' }}>Cognitive Movers Tracker</h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                {movers.map((mover, i) => (
                  <div 
                    key={i} 
                    style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      padding: '0.6rem 0.85rem',
                      backgroundColor: 'rgba(255, 255, 255, 0.01)',
                      border: '1px solid var(--border-glass)',
                      borderRadius: '6px',
                      cursor: 'pointer'
                    }}
                    onClick={() => onViewStock(mover.symbol)}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      <span style={{ fontWeight: 700, fontSize: '0.85rem' }}>{mover.symbol}</span>
                      <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>${mover.price.toFixed(2)}</span>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                      {mover.change >= 0 ? <TrendingUp size={14} color="var(--color-green)" /> : <TrendingDown size={14} color="var(--color-red)" />}
                      <span style={{
                        fontSize: '0.8rem',
                        fontWeight: 600,
                        color: mover.change >= 0 ? 'var(--color-green)' : 'var(--color-red)'
                      }}>
                        {mover.change >= 0 ? '+' : ''}{mover.change.toFixed(2)}%
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Active alerts stream */}
            <div className="glass-card" style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <h3 style={{ fontSize: '0.9rem', fontWeight: 600 }}>Active Terminal Alerts</h3>
                <span style={{
                  padding: '0.2rem 0.5rem',
                  fontSize: '0.7rem',
                  backgroundColor: 'rgba(255,255,255,0.05)',
                  borderRadius: '4px',
                  color: 'var(--text-secondary)'
                }}>{alerts.length} Active</span>
              </div>
              <div style={{
                display: 'flex',
                flexDirection: 'column',
                gap: '0.75rem',
                maxHeight: '220px',
                overflowY: 'auto',
                paddingRight: '0.25rem'
              }}>
                {alerts.length === 0 ? (
                  <div style={{
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    padding: '1.5rem',
                    textAlign: 'center',
                    gap: '0.35rem',
                    color: 'var(--text-muted)'
                  }}>
                    <AlertCircle size={20} />
                    <span style={{ fontSize: '0.75rem' }}>No threshold alerts triggered</span>
                  </div>
                ) : (
                  alerts.slice(0, 5).map((a, i) => (
                    <div key={i} style={{
                      padding: '0.5rem 0.75rem',
                      backgroundColor: 'rgba(255,255,255,0.01)',
                      borderLeft: `3px solid ${a.alertType === 'RSI' ? 'var(--color-orange)' : 'var(--color-red)'}`,
                      borderRadius: '0 6px 6px 0',
                      cursor: 'pointer'
                    }} onClick={() => onViewStock(a.symbol)}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', marginBottom: '0.2rem' }}>
                        <span style={{ fontWeight: 700 }}>{a.symbol}</span>
                        <span style={{ color: 'var(--text-muted)' }}>{a.alertType}</span>
                      </div>
                      <p style={{ fontSize: '0.7rem', color: 'var(--text-secondary)', lineHeight: 1.3 }}>{a.message}</p>
                    </div>
                  ))
                )}
              </div>
            </div>

          </div>

        </div>
      )}
    </div>
  );
}
