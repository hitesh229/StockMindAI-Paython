import React from 'react';
import { LayoutDashboard, Heart, Wallet, Bot, Settings, LogOut, TrendingUp } from 'lucide-react';
import { authService } from '../services/api';

export default function Sidebar({ currentPage, setCurrentPage }) {
  const menuItems = [
    { id: 'dashboard', name: 'Dashboard', icon: LayoutDashboard },
    { id: 'watchlist', name: 'Watchlist', icon: Heart },
    { id: 'portfolio', name: 'Portfolio', icon: Wallet },
    { id: 'advisor', name: 'AI Advisor', icon: Bot },
    { id: 'settings', name: 'Settings', icon: Settings },
  ];

  const handleLogout = () => {
    authService.logout();
    window.location.reload();
  };

  return (
    <aside style={{
      width: '260px',
      backgroundColor: 'var(--bg-dark)',
      borderRight: '1px solid var(--border-glass)',
      display: 'flex',
      flexDirection: 'column',
      height: '100vh',
      position: 'fixed',
      left: 0,
      top: 0,
      zIndex: 10,
    }}>
      {/* Brand Header */}
      <div style={{
        padding: '2rem 1.5rem',
        display: 'flex',
        alignItems: 'center',
        gap: '0.75rem',
        borderBottom: '1px solid var(--border-glass)',
      }}>
        <div style={{
          background: 'linear-gradient(135deg, #2563eb, #10b981)',
          padding: '0.5rem',
          borderRadius: '8px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}>
          <TrendingUp size={24} color="white" />
        </div>
        <div>
          <h1 style={{ fontSize: '1.25rem', fontWeight: 700, letterSpacing: '-0.5px' }}>StockMind<span style={{ color: '#3b82f6' }}>AI</span></h1>
          <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Market Intelligence</p>
        </div>
      </div>

      {/* Nav Menu */}
      <nav style={{ padding: '2rem 1rem', flex: 1, display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
        {menuItems.map((item) => {
          const Icon = item.icon;
          const isActive = currentPage === item.id;
          return (
            <button
              key={item.id}
              onClick={() => setCurrentPage(item.id)}
              style={{
                width: '100%',
                display: 'flex',
                alignItems: 'center',
                gap: '1rem',
                padding: '0.85rem 1rem',
                borderRadius: '8px',
                textAlign: 'left',
                background: isActive ? 'rgba(59, 130, 246, 0.08)' : 'transparent',
                color: isActive ? 'var(--color-blue)' : 'var(--text-secondary)',
                borderLeft: isActive ? '3px solid var(--color-blue)' : '3px solid transparent',
              }}
              className="nav-item-btn"
            >
              <Icon size={20} />
              <span style={{ fontWeight: 500 }}>{item.name}</span>
            </button>
          );
        })}
      </nav>

      {/* Logout Footer */}
      <div style={{ padding: '1.5rem 1rem', borderTop: '1px solid var(--border-glass)' }}>
        <button
          onClick={handleLogout}
          style={{
            width: '100%',
            display: 'flex',
            alignItems: 'center',
            gap: '1rem',
            padding: '0.85rem 1rem',
            borderRadius: '8px',
            color: 'var(--color-red)',
            background: 'transparent',
            textAlign: 'left',
          }}
        >
          <LogOut size={20} />
          <span style={{ fontWeight: 500 }}>Sign Out</span>
        </button>
      </div>
    </aside>
  );
}
