import React, { useState } from 'react';
import { Shield, Target, Save, RefreshCw, CheckCircle, AlertTriangle, User as UserIcon } from 'lucide-react';
import { authService } from '../services/api';

export default function Settings({ user, onProfileUpdate }) {
  const [riskAppetite, setRiskAppetite] = useState(user.riskAppetite || 'Medium');
  const [investmentGoals, setInvestmentGoals] = useState(user.investmentGoals || 'Wealth Accumulation');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);

    try {
      const updatedUser = await authService.updateProfile(riskAppetite, investmentGoals);
      
      // Update local storage and notify App parent state
      const localData = JSON.parse(localStorage.getItem('user'));
      const newLocalData = { ...localData, riskAppetite: updatedUser.riskAppetite, investmentGoals: updatedUser.investmentGoals };
      localStorage.setItem('user', JSON.stringify(newLocalData));
      
      onProfileUpdate(newLocalData);
      setSuccess('Analyst profile parameters updated successfully.');
    } catch (err) {
      console.error(err);
      setError('Failed modifying profile values. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', paddingBottom: '3rem', maxWidth: '600px' }}>
      
      {/* Header Info */}
      <div style={{
        borderBottom: '1px solid var(--border-glass)',
        paddingBottom: '1rem'
      }}>
        <h2 style={{ fontSize: '1.35rem', fontWeight: 700 }}>Profile Settings</h2>
        <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Modify your risk tolerance boundaries and financial goals dynamically</p>
      </div>

      {/* Error & Success indicators */}
      {error && (
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.75rem 1rem', backgroundColor: 'rgba(239, 68, 68, 0.1)', border: '1px solid rgba(239, 68, 68, 0.2)', borderRadius: '8px', color: 'var(--color-red)', fontSize: '0.8rem' }}>
          <AlertTriangle size={16} />
          <span>{error}</span>
        </div>
      )}
      {success && (
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.75rem 1rem', backgroundColor: 'rgba(16, 185, 129, 0.1)', border: '1px solid rgba(16, 185, 129, 0.2)', borderRadius: '8px', color: 'var(--color-green)', fontSize: '0.8rem' }}>
          <CheckCircle size={16} />
          <span>{success}</span>
        </div>
      )}

      {/* Settings Form Card */}
      <div className="glass-card" style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
        
        {/* User Card Segment */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '1rem',
          borderBottom: '1px solid var(--border-glass)',
          paddingBottom: '1.25rem'
        }}>
          <div style={{
            width: '50px',
            height: '50px',
            backgroundColor: 'var(--color-blue)',
            borderRadius: '50%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}>
            <UserIcon size={24} color="white" />
          </div>
          <div>
            <h3 style={{ fontSize: '1.05rem', fontWeight: 700 }}>{user.username}</h3>
            <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>{user.email}</span>
          </div>
        </div>

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          
          {/* Risk Appetite Selection */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            <label style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
              <Shield size={16} color="var(--color-blue)" />
              <span>Risk Appetite Threshold</span>
            </label>
            <select
              value={riskAppetite}
              onChange={(e) => setRiskAppetite(e.target.value)}
              style={{ width: '100%', cursor: 'pointer' }}
              disabled={loading}
            >
              <option value="Low">Low (Defensive, capital preservation)</option>
              <option value="Medium">Medium (Balanced growth/moderate risk)</option>
              <option value="High">High (Aggressive trading, high volatility)</option>
            </select>
            <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>
              Alters high-fidelity advisor consensus ratings and balances portfolio health recommendations.
            </span>
          </div>

          {/* Investment Goals Selection */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            <label style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
              <Target size={16} color="var(--color-blue)" />
              <span>Primary Investment Goal</span>
            </label>
            <select
              value={investmentGoals}
              onChange={(e) => setInvestmentGoals(e.target.value)}
              style={{ width: '100%', cursor: 'pointer' }}
              disabled={loading}
            >
              <option value="Wealth Accumulation">Wealth Accumulation (Compounding assets)</option>
              <option value="Retirement Planning">Retirement Planning (Defensive indexing)</option>
              <option value="Active Trading">Active Breakout Trading (High turnover)</option>
              <option value="Long-term Value">Long-term Value Investing (Value screening)</option>
            </select>
            <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>
              Assists the AI advisor in tuning conversational guidance strategies.
            </span>
          </div>

          {/* Save Button */}
          <button
            type="submit"
            className="btn-primary"
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '0.5rem',
              padding: '0.75rem 1.5rem',
              alignSelf: 'flex-start',
              marginTop: '0.5rem',
              cursor: loading ? 'not-allowed' : 'pointer'
            }}
            disabled={loading}
          >
            {loading ? <RefreshCw className="animate-spin" size={16} /> : <Save size={16} />}
            <span>{loading ? 'Saving Changes...' : 'Save Parameters'}</span>
          </button>

        </form>

      </div>

    </div>
  );
}
