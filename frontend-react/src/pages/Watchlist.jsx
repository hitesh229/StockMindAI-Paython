import React, { useState, useEffect, useRef } from 'react';
import { Plus, Heart, RefreshCw, Trash2, ArrowUpRight, AlertTriangle, TrendingUp, TrendingDown, HelpCircle } from 'lucide-react';
import { stockService } from '../services/api';

export default function Watchlist({ onViewStock, watchlist, onRefreshWatchlist }) {
  const [loading, setLoading] = useState(false);
  const [newSymbol, setNewSymbol] = useState('');
  const [error, setError] = useState('');

  // Watchlist Autocomplete State
  const [suggestions, setSuggestions] = useState([]);
  const [showDropdown, setShowDropdown] = useState(false);
  const [searching, setSearching] = useState(false);
  const dropdownRef = useRef(null);

  // Debounced search logic for autocomplete suggestions
  useEffect(() => {
    const delayDebounceFn = setTimeout(async () => {
      const query = newSymbol.trim();
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
  }, [newSymbol]);

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

  const handleAddSymbol = async (e) => {
    e.preventDefault();
    if (!newSymbol.trim()) return;

    setError('');
    const symbolToAdd = newSymbol.trim().toUpperCase();

    try {
      await stockService.addToWatchlist(symbolToAdd);
      setNewSymbol('');
      onRefreshWatchlist(); // trigger parent reload
    } catch (err) {
      console.error(err);
      setError(`Failed adding "${symbolToAdd}". Verify ticker symbol matches yFinance specifications.`);
    }
  };

  const handleRemoveSymbol = async (e, symbol) => {
    e.stopPropagation(); // prevent card click to detail page navigation
    try {
      await stockService.removeFromWatchlist(symbol);
      onRefreshWatchlist();
    } catch (err) {
      console.error(err);
      setError(`Failed removing "${symbol}" from watchlist.`);
    }
  };

  // Helper to color recommendation badges
  const getRatingBadge = (rating) => {
    if (!rating) return null;
    const isBuy = rating.toUpperCase().includes('BUY');
    const isSell = rating.toUpperCase().includes('SELL');
    
    return (
      <span style={{
        padding: '0.2rem 0.5rem',
        fontSize: '0.7rem',
        fontWeight: 600,
        borderRadius: '4px',
        backgroundColor: isBuy ? 'rgba(16, 185, 129, 0.1)' : (isSell ? 'rgba(239, 68, 68, 0.1)' : 'rgba(245, 158, 11, 0.1)'),
        color: isBuy ? 'var(--color-green)' : (isSell ? 'var(--color-red)' : 'var(--color-orange)'),
        border: '1px solid',
        borderColor: isBuy ? 'rgba(16, 185, 129, 0.2)' : (isSell ? 'rgba(239, 68, 68, 0.2)' : 'rgba(245, 158, 11, 0.2)')
      }}>
        {rating}
      </span>
    );
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', paddingBottom: '4rem' }}>
      
      {/* Header Info */}
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
          <h2 style={{ fontSize: '1.35rem', fontWeight: 700 }}>Market Watchlist</h2>
          <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Keep track of favorite ticker symbols, their consensus ratings, and key indicators</p>
        </div>

        {/* Add Ticker Symbol Form with Autocomplete */}
        <form onSubmit={handleAddSymbol} style={{ display: 'flex', gap: '0.5rem', position: 'relative' }} ref={dropdownRef}>
          <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
            <input
              type="text"
              placeholder="Add ticker (e.g. NVDA)..."
              value={newSymbol}
              onChange={(e) => setNewSymbol(e.target.value)}
              onFocus={() => { if (suggestions.length > 0) setShowDropdown(true); }}
              style={{ padding: '0.5rem 0.75rem', fontSize: '0.85rem', minWidth: '220px' }}
            />
            
            {/* Glassmorphic Autocomplete suggestions dropdown */}
            {showDropdown && suggestions.length > 0 && (
              <div style={{
                position: 'absolute',
                top: '40px',
                left: 0,
                right: 0,
                backgroundColor: 'rgba(17, 24, 39, 0.95)',
                border: '1px solid var(--border-glass)',
                borderRadius: '8px',
                boxShadow: '0 10px 25px rgba(0, 0, 0, 0.5)',
                maxHeight: '240px',
                overflowY: 'auto',
                zIndex: 999,
                backdropFilter: 'blur(12px)',
                padding: '0.5rem 0',
                minWidth: '240px'
              }}>
                {suggestions.map((s, idx) => (
                  <div
                    key={idx}
                    onClick={async () => {
                      try {
                        await stockService.addToWatchlist(s.symbol);
                        setNewSymbol('');
                        setShowDropdown(false);
                        onRefreshWatchlist();
                      } catch (err) {
                        console.error(err);
                        setError(`Failed adding "${s.symbol}".`);
                      }
                    }}
                    style={{
                      display: 'flex',
                      flexDirection: 'column',
                      gap: '0.2rem',
                      padding: '0.6rem 1rem',
                      cursor: 'pointer',
                      borderBottom: idx < suggestions.length - 1 ? '1px solid rgba(255,255,255,0.03)' : 'none',
                      transition: 'background-color 0.15s ease',
                      textAlign: 'left'
                    }}
                    className="hover:bg-white/5"
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span style={{ fontWeight: 700, fontSize: '0.8rem', color: 'var(--text-primary)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', marginRight: '0.5rem' }}>{s.name}</span>
                      <div style={{ display: 'flex', gap: '0.25rem', flexShrink: 0 }}>
                        {s.exchange && (
                          <span style={{
                            fontSize: '0.6rem',
                            padding: '0.05rem 0.25rem',
                            backgroundColor: 'rgba(59, 130, 246, 0.1)',
                            color: 'var(--color-blue)',
                            borderRadius: '2px',
                            fontWeight: 600
                          }}>{s.exchange}</span>
                        )}
                      </div>
                    </div>
                    <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>
                      {s.symbol}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
          <button type="submit" className="btn-primary" style={{ padding: '0.5rem 1rem', fontSize: '0.85rem', display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
            <Plus size={16} />
            <span>Add</span>
          </button>
        </form>
      </div>

      {/* Error display */}
      {error && (
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.75rem 1rem', backgroundColor: 'rgba(239, 68, 68, 0.1)', border: '1px solid rgba(239, 68, 68, 0.2)', borderRadius: '8px', color: 'var(--color-red)', fontSize: '0.8rem' }}>
          <AlertTriangle size={16} />
          <span>{error}</span>
        </div>
      )}

      {loading ? (
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '200px' }}>
          <RefreshCw size={24} className="animate-spin text-blue-500" style={{ color: 'var(--color-blue)' }} />
        </div>
      ) : watchlist.length === 0 ? (
        <div className="glass-card" style={{ display: 'flex', flexDirection: 'column', gap: '1rem', alignItems: 'center', justifyContent: 'center', minHeight: '250px', textAlign: 'center' }}>
          <Heart size={36} color="var(--text-muted)" style={{ opacity: 0.5 }} />
          <div>
            <h3 style={{ fontSize: '1rem', fontWeight: 600 }}>Your Watchlist is Empty</h3>
            <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '4px' }}>Add stock tickers using the bar above to begin monitoring</p>
          </div>
        </div>
      ) : (
        /* Grid of stock cards */
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
          gap: '1.25rem'
        }}>
          {watchlist.map((item) => {
            const price = item.price || 150.0;
            const change = item.change || 0.0;
            const changePercent = item.changePercent || 0.0;
            const isPositive = change >= 0;

            return (
              <div 
                key={item.id} 
                className="glass-card"
                onClick={() => onViewStock(item.symbol)}
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '1rem',
                  padding: '1.25rem',
                  cursor: 'pointer',
                  position: 'relative'
                }}
              >
                {/* Header segment */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <div>
                    <h3 style={{ fontSize: '1.15rem', fontWeight: 700, maxWidth: '170px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {item.companyName || item.symbol}
                    </h3>
                    <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', display: 'block' }}>
                      {item.companyName ? item.symbol : 'Stock Ticker Profile'}
                    </span>
                  </div>
                  
                  {/* Action triggers */}
                  <div style={{ display: 'flex', gap: '0.5rem' }}>
                    <button 
                      onClick={(e) => handleRemoveSymbol(e, item.symbol)}
                      style={{
                        background: 'transparent',
                        padding: '0.3rem',
                        color: 'var(--text-muted)'
                      }}
                      className="hover:text-red-400"
                    >
                      <Trash2 size={16} />
                    </button>
                    <div style={{
                      padding: '0.3rem',
                      color: 'var(--text-muted)'
                    }} className="hover:text-white">
                      <ArrowUpRight size={16} />
                    </div>
                  </div>
                </div>

                {/* Price indicators */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontSize: '1.35rem', fontWeight: 700, fontFamily: 'var(--font-mono)' }}>
                    ${price?.toFixed(2)}
                  </span>
                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.2rem',
                    fontSize: '0.8rem',
                    fontWeight: 600,
                    color: isPositive ? 'var(--color-green)' : 'var(--color-red)'
                  }}>
                    {isPositive ? <TrendingUp size={12} /> : <TrendingDown size={12} />}
                    <span>{isPositive ? '+' : ''}{changePercent?.toFixed(2)}%</span>
                  </div>
                </div>

                {/* Additional metrics info bottom segment */}
                <div style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  borderTop: '1px solid var(--border-glass)',
                  paddingTop: '0.75rem',
                  fontSize: '0.75rem'
                }}>
                  <span style={{ color: 'var(--text-muted)' }}>AI Consensus:</span>
                  {getRatingBadge(item.recommendationRating || 'HOLD')}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
