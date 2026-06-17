import React, { useState } from 'react';
import { LogIn, Key, Mail, TrendingUp, AlertCircle } from 'lucide-react';
import { authService } from '../services/api';

export default function Login({ onLoginSuccess, setCurrentPage }) {
  const [usernameOrEmail, setUsernameOrEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!usernameOrEmail || !password) {
      setError('Please provide username/email and password.');
      return;
    }

    setError('');
    setLoading(true);

    try {
      const data = await authService.login(usernameOrEmail, password);
      onLoginSuccess(data);
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.message || 'Invalid credentials or connection timeout.');
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
      padding: '1.5rem',
      position: 'relative',
      overflow: 'hidden'
    }}>
      {/* Background radial overlays */}
      <div style={{
        position: 'absolute',
        width: '400px',
        height: '400px',
        background: 'radial-gradient(circle, rgba(59, 130, 246, 0.08) 0%, transparent 70%)',
        top: '-10%',
        left: '-10%',
        zIndex: 0
      }}></div>
      <div style={{
        position: 'absolute',
        width: '400px',
        height: '400px',
        background: 'radial-gradient(circle, rgba(16, 185, 129, 0.05) 0%, transparent 70%)',
        bottom: '-10%',
        right: '-10%',
        zIndex: 0
      }}></div>

      <div 
        className="glass-card glow-blue" 
        style={{
          width: '100%',
          maxWidth: '400px',
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
            background: 'linear-gradient(135deg, #2563eb, #10b981)',
            padding: '0.75rem',
            borderRadius: '12px',
            boxShadow: '0 8px 24px rgba(37, 99, 235, 0.25)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            marginBottom: '0.5rem'
          }}>
            <TrendingUp size={28} color="white" />
          </div>
          <h2 style={{ fontSize: '1.5rem', fontWeight: 700, letterSpacing: '-0.5px' }}>
            StockMind<span style={{ color: '#3b82f6' }}>AI</span>
          </h2>
          <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Sign in to continue to the intelligence terminal</p>
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
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          {/* Username / Email */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
            <label style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-secondary)' }}>Username or Email</label>
            <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
              <Mail size={16} color="var(--text-muted)" style={{ position: 'absolute', left: '12px' }} />
              <input
                type="text"
                placeholder="Enter username or email"
                value={usernameOrEmail}
                onChange={(e) => setUsernameOrEmail(e.target.value)}
                style={{ width: '100%', paddingLeft: '2.5rem' }}
                disabled={loading}
              />
            </div>
          </div>

          {/* Password */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
            <label style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-secondary)' }}>Security Password</label>
            <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
              <Key size={16} color="var(--text-muted)" style={{ position: 'absolute', left: '12px' }} />
              <input
                type="password"
                placeholder="Enter password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                style={{ width: '100%', paddingLeft: '2.5rem' }}
                disabled={loading}
              />
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
              cursor: loading ? 'not-allowed' : 'pointer',
              opacity: loading ? 0.75 : 1
            }}
            disabled={loading}
          >
            <LogIn size={18} />
            <span>{loading ? 'Authenticating...' : 'Sign In to Terminal'}</span>
          </button>
        </form>

        {/* Redirect toggle footer */}
        <p style={{
          fontSize: '0.8rem',
          color: 'var(--text-secondary)',
          textAlign: 'center',
          marginTop: '0.5rem'
        }}>
          Don't have an analyst account?{' '}
          <button
            onClick={() => setCurrentPage('register')}
            style={{
              background: 'transparent',
              color: 'var(--color-blue)',
              fontWeight: 600
            }}
          >
            Create Profile
          </button>
        </p>
      </div>
    </div>
  );
}
