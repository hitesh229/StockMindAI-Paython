import React, { useState } from 'react';
import { UserPlus, Key, Mail, User, Shield, Target, TrendingUp, AlertCircle } from 'lucide-react';
import { authService } from '../services/api';

export default function Register({ onLoginSuccess, setCurrentPage }) {
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [riskAppetite, setRiskAppetite] = useState('Medium');
  const [investmentGoals, setInvestmentGoals] = useState('Wealth Accumulation');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!username || !email || !password) {
      setError('Please fill in all security fields.');
      return;
    }

    setError('');
    setLoading(true);

    try {
      const data = await authService.register(username, email, password, riskAppetite, investmentGoals);
      onLoginSuccess(data);
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.message || 'Failed creating account. Username/email may be taken.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      minHeight: '100vh',
      backgroundColor: 'var(--bg-deep)',
      padding: '2rem 1.5rem',
      position: 'relative',
      overflow: 'hidden'
    }}>
      {/* Background radial overlays */}
      <div style={{
        position: 'absolute',
        width: '450px',
        height: '450px',
        background: 'radial-gradient(circle, rgba(16, 185, 129, 0.06) 0%, transparent 70%)',
        top: '-10%',
        right: '-10%',
        zIndex: 0
      }}></div>
      <div style={{
        position: 'absolute',
        width: '450px',
        height: '450px',
        background: 'radial-gradient(circle, rgba(59, 130, 246, 0.05) 0%, transparent 70%)',
        bottom: '-10%',
        left: '-10%',
        zIndex: 0
      }}></div>

      <div 
        className="glass-card glow-green" 
        style={{
          width: '100%',
          maxWidth: '440px',
          padding: '2.5rem 2rem',
          zIndex: 1,
          display: 'flex',
          flexDirection: 'column',
          gap: '1.5rem'
        }}
      >
        {/* Brand logo header */}
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.5rem', textAlign: 'center' }}>
          <div style={{
            background: 'linear-gradient(135deg, #10b981, #2563eb)',
            padding: '0.75rem',
            borderRadius: '12px',
            boxShadow: '0 8px 24px rgba(16, 185, 129, 0.25)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            marginBottom: '0.5rem'
          }}>
            <TrendingUp size={28} color="white" />
          </div>
          <h2 style={{ fontSize: '1.5rem', fontWeight: 700, letterSpacing: '-0.5px' }}>
            Join StockMind<span style={{ color: '#10b981' }}>AI</span>
          </h2>
          <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Configure your risk appetite and create your investment goals</p>
        </div>

        {/* Error notification banner */}
        {error && (
          <div style={{
            display: 'flex',
            alignItems: 'flex-start',
            gap: '0.5rem',
            padding: '0.75rem 1rem',
            backgroundColor: 'rgba(239, 68, 68, 0.1)',
            border: '1px solid rgba(239, 68, 68, 0.25)',
            borderRadius: '8px',
            color: 'var(--color-red)',
            fontSize: '0.8rem',
            lineHeight: 1.4
          }}>
            <AlertCircle size={16} style={{ flexShrink: 0, marginTop: '2px' }} />
            <span>{error}</span>
          </div>
        )}

        {/* Auth form fields */}
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.2rem' }}>
          {/* Username */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
            <label style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-secondary)' }}>Security Nickname</label>
            <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
              <User size={16} color="var(--text-muted)" style={{ position: 'absolute', left: '12px' }} />
              <input
                type="text"
                placeholder="Pick a unique username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                style={{ width: '100%', paddingLeft: '2.5rem' }}
                disabled={loading}
              />
            </div>
          </div>

          {/* Email */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
            <label style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-secondary)' }}>Email Address</label>
            <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
              <Mail size={16} color="var(--text-muted)" style={{ position: 'absolute', left: '12px' }} />
              <input
                type="email"
                placeholder="Enter contact email address"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                style={{ width: '100%', paddingLeft: '2.5rem' }}
                disabled={loading}
              />
            </div>
          </div>

          {/* Password */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
            <label style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-secondary)' }}>Analyst Password</label>
            <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
              <Key size={16} color="var(--text-muted)" style={{ position: 'absolute', left: '12px' }} />
              <input
                type="password"
                placeholder="Create strong security password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                style={{ width: '100%', paddingLeft: '2.5rem' }}
                disabled={loading}
              />
            </div>
          </div>

          {/* Risk Appetite Selector */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
            <label style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-secondary)' }}>Risk Appetite Tier</label>
            <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
              <Shield size={16} color="var(--text-muted)" style={{ position: 'absolute', left: '12px' }} />
              <select
                value={riskAppetite}
                onChange={(e) => setRiskAppetite(e.target.value)}
                style={{ width: '100%', paddingLeft: '2.5rem', appearance: 'none', cursor: 'pointer' }}
                disabled={loading}
              >
                <option value="Low">Low (Defensive, capital preservation)</option>
                <option value="Medium">Medium (Balanced growth/moderate risk)</option>
                <option value="High">High (Aggressive trading, high volatility)</option>
              </select>
            </div>
          </div>

          {/* Investment Goals */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
            <label style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-secondary)' }}>Primary Investment Goal</label>
            <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
              <Target size={16} color="var(--text-muted)" style={{ position: 'absolute', left: '12px' }} />
              <select
                value={investmentGoals}
                onChange={(e) => setInvestmentGoals(e.target.value)}
                style={{ width: '100%', paddingLeft: '2.5rem', appearance: 'none', cursor: 'pointer' }}
                disabled={loading}
              >
                <option value="Wealth Accumulation">Wealth Accumulation (Compounding assets)</option>
                <option value="Retirement Planning">Retirement Planning (Defensive indexing)</option>
                <option value="Active Trading">Active Breakout Trading (High turnover)</option>
                <option value="Long-term Value">Long-term Value Investing (Value screening)</option>
              </select>
            </div>
          </div>

          {/* Action button */}
          <button
            type="submit"
            className="btn-primary"
            style={{
              width: '100%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '0.5rem',
              padding: '0.85rem',
              fontSize: '0.9rem',
              marginTop: '0.5rem',
              background: 'linear-gradient(135deg, var(--color-green), #059669)',
              cursor: loading ? 'not-allowed' : 'pointer',
              opacity: loading ? 0.75 : 1
            }}
            disabled={loading}
          >
            <UserPlus size={18} />
            <span>{loading ? 'Initializing Terminal...' : 'Initialize Analyst Profile'}</span>
          </button>
        </form>

        {/* Redirect toggle footer */}
        <p style={{
          fontSize: '0.8rem',
          color: 'var(--text-secondary)',
          textAlign: 'center',
          marginTop: '0.5rem'
        }}>
          Already have an analyst account?{' '}
          <button
            onClick={() => setCurrentPage('login')}
            style={{
              background: 'transparent',
              color: 'var(--color-blue)',
              fontWeight: 600
            }}
          >
            Sign In
          </button>
        </p>
      </div>
    </div>
  );
}
