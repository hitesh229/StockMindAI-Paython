import React, { useState, useEffect } from 'react';
import { Bell, Shield, User as UserIcon } from 'lucide-react';
import { stockService } from '../services/api';

export default function Navbar({ user }) {
  const [alerts, setAlerts] = useState([]);
  const [showDropdown, setShowDropdown] = useState(false);

  const fetchAlerts = async () => {
    try {
      const data = await stockService.getAlerts();
      setAlerts(data);
    } catch (error) {
      console.error('Failed fetching alerts:', error);
    }
  };

  useEffect(() => {
    fetchAlerts();
    const interval = setInterval(fetchAlerts, 15000); // refresh every 15s
    return () => clearInterval(interval);
  }, []);

  const handleMarkAsRead = async () => {
    try {
      await stockService.markAlertsRead();
      fetchAlerts();
    } catch (error) {
      console.error(error);
    }
  };

  const unreadCount = alerts.filter(a => !a.isRead).length;

  return (
    <header style={{
      height: '70px',
      backgroundColor: 'var(--bg-dark)',
      borderBottom: '1px solid var(--border-glass)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      padding: '0 2rem',
      position: 'fixed',
      top: 0,
      right: 0,
      left: '260px',
      zIndex: 9,
    }}>
      {/* Title */}
      <div>
        <h2 style={{ fontSize: '1.15rem', fontWeight: 600 }}>Welcome back, <span style={{ color: '#3b82f6' }}>{user.username}</span></h2>
        <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Intel Core Dashboard | Trading System Status: Online</p>
      </div>

      {/* Action panel */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
        {/* Risk Appetite Badge */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '0.5rem',
          padding: '0.4rem 0.85rem',
          backgroundColor: 'rgba(255, 255, 255, 0.03)',
          border: '1px solid var(--border-glass)',
          borderRadius: '20px',
          fontSize: '0.85rem',
        }}>
          <Shield size={16} color="#3b82f6" />
          <span style={{ color: 'var(--text-secondary)' }}>Risk Appetite: </span>
          <span style={{
            fontWeight: 600,
            color: user.riskAppetite === 'High' ? 'var(--color-red)' : (user.riskAppetite === 'Low' ? 'var(--color-green)' : 'var(--color-orange)'),
          }}>
            {user.riskAppetite}
          </span>
        </div>

        {/* Notifications Alert Bell */}
        <div style={{ position: 'relative' }}>
          <button
            onClick={() => {
              setShowDropdown(!showDropdown);
              if (!showDropdown && unreadCount > 0) {
                handleMarkAsRead();
              }
            }}
            style={{
              background: 'transparent',
              position: 'relative',
              padding: '0.5rem',
              borderRadius: '50%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              backgroundColor: showDropdown ? 'rgba(255, 255, 255, 0.05)' : 'transparent',
            }}
          >
            <Bell size={20} color="var(--text-secondary)" />
            {unreadCount > 0 && (
              <span style={{
                position: 'absolute',
                top: '4px',
                right: '4px',
                width: '10px',
                height: '10px',
                backgroundColor: 'var(--color-red)',
                borderRadius: '50%',
                border: '2px solid var(--bg-dark)',
              }} className="pulse-indicator"></span>
            )}
          </button>

          {/* Alerts Dropdown List */}
          {showDropdown && (
            <div style={{
              position: 'absolute',
              top: '45px',
              right: 0,
              width: '320px',
              backgroundColor: 'rgba(17, 24, 39, 0.95)',
              border: '1px solid var(--border-glass)',
              borderRadius: '8px',
              boxShadow: '0 10px 25px rgba(0, 0, 0, 0.5)',
              padding: '1rem',
              maxHeight: '400px',
              overflowY: 'auto',
              backdropFilter: 'blur(10px)',
            }}>
              <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                marginBottom: '0.75rem',
                borderBottom: '1px solid var(--border-glass)',
                paddingBottom: '0.5rem',
              }}>
                <h4 style={{ fontWeight: 600, fontSize: '0.9rem' }}>Market intelligence Alerts</h4>
                {unreadCount > 0 && (
                  <button onClick={handleMarkAsRead} style={{ fontSize: '0.75rem', color: 'var(--color-blue)', background: 'transparent' }}>
                    Mark all read
                  </button>
                )}
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                {alerts.length === 0 ? (
                  <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', textAlign: 'center', padding: '1rem 0' }}>
                    No alerts triggered.
                  </p>
                ) : (
                  alerts.map((a) => (
                    <div
                      key={a.id}
                      style={{
                        padding: '0.6rem',
                        backgroundColor: a.isRead ? 'transparent' : 'rgba(59, 130, 246, 0.05)',
                        borderLeft: `3px solid ${a.alertType === 'RSI' ? 'var(--color-orange)' : 'var(--color-red)'}`,
                        borderRadius: '0 4px 4px 0',
                      }}
                    >
                      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', color: 'var(--text-secondary)', marginBottom: '0.2rem' }}>
                        <span style={{ fontWeight: 600 }}>{a.symbol} ({a.alertType})</span>
                        <span style={{ color: 'var(--text-muted)' }}>{new Date(a.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                      </div>
                      <p style={{ fontSize: '0.75rem', color: 'var(--text-primary)', lineHeight: 1.3 }}>{a.message}</p>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}
        </div>

        {/* User icon */}
        <div style={{
          width: '36px',
          height: '36px',
          backgroundColor: '#3b82f6',
          borderRadius: '50%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}>
          <UserIcon size={18} color="white" />
        </div>
      </div>
    </header>
  );
}
