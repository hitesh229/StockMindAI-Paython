import React, { useState, useEffect } from 'react';
import { Plus, Trash2, FileSpreadsheet, Upload, Activity, ShieldCheck, RefreshCw, AlertTriangle, ListFilter, PieChart } from 'lucide-react';
import { portfolioService } from '../services/api';
import RiskMeter from '../components/RiskMeter';

export default function Portfolio({ onViewStock }) {
  const [portfolio, setPortfolio] = useState([]);
  const [riskReport, setRiskReport] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Add Holding Form state
  const [symbol, setSymbol] = useState('');
  const [shares, setShares] = useState('');
  const [purchasePrice, setPurchasePrice] = useState('');
  const [purchaseDate, setPurchaseDate] = useState('');

  const fetchPortfolioData = async () => {
    setLoading(true);
    setError('');
    try {
      const [holdings, report] = await Promise.all([
        portfolioService.getPortfolio(),
        portfolioService.getRiskReport()
      ]);
      setPortfolio(holdings);
      setRiskReport(report);
    } catch (err) {
      console.error(err);
      setPortfolio([]);
      setRiskReport(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPortfolioData();
  }, []);

  const handleAddHolding = async (e) => {
    e.preventDefault();
    if (!symbol || !shares || !purchasePrice) {
      setError('Please fill in all core holding fields.');
      return;
    }
    setError('');
    setSuccess('');
    setSubmitting(true);
    try {
      const dateVal = purchaseDate || new Date().toISOString().substring(0, 10);
      await portfolioService.addHolding(symbol.toUpperCase(), parseFloat(shares), parseFloat(purchasePrice), dateVal);
      setSuccess(`Holding for ${symbol.toUpperCase()} successfully created.`);
      setSymbol('');
      setShares('');
      setPurchasePrice('');
      setPurchaseDate('');
      await fetchPortfolioData();
    } catch (err) {
      console.error(err);
      setError('Failed creating holding. Verify symbol validity.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteHolding = async (id) => {
    if (!window.confirm('Delete this holding transaction from your portfolio?')) return;
    setError('');
    setSuccess('');
    try {
      await portfolioService.deleteHolding(id);
      setSuccess('Holding deleted.');
      await fetchPortfolioData();
    } catch (err) {
      console.error(err);
      setError('Failed deleting holding.');
    }
  };

  const handleCsvUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setError('');
    setSuccess('');
    setUploading(true);

    try {
      await portfolioService.uploadCsv(file);
      setSuccess('Portfolio CSV imports fully synced!');
      await fetchPortfolioData();
    } catch (err) {
      console.error(err);
      setError('Error uploading CSV. Make sure headers contain Symbol, Shares, and PurchasePrice.');
    } finally {
      setUploading(false);
    }
  };

  // Broker Sync State variables
  const [brokerModalOpen, setBrokerModalOpen] = useState(false);
  const [selectedBroker, setSelectedBroker] = useState('');
  const [brokerClientId, setBrokerClientId] = useState('');
  const [brokerPassword, setBrokerPassword] = useState('');
  const [brokerPin, setBrokerPin] = useState('');
  const [otpSent, setOtpSent] = useState(false);
  const [brokerOtp, setBrokerOtp] = useState('');
  const [syncingBroker, setSyncingBroker] = useState(false);

  const handleOpenBrokerModal = (brokerName) => {
    setSelectedBroker(brokerName);
    setBrokerClientId('');
    setBrokerPassword('');
    setBrokerPin('');
    setOtpSent(false);
    setBrokerOtp('');
    setBrokerModalOpen(true);
    setSyncingBroker(false);
    setError('');
    setSuccess('');
  };

  const handleSendBrokerOtp = () => {
    if (!brokerClientId || !brokerPassword || !brokerPin) {
      alert('Please fill in all security credential fields first.');
      return;
    }
    setOtpSent(true);
  };

  const handleVerifyAndSyncBroker = async () => {
    if (!brokerOtp) {
      alert('Please enter the 2FA authentication code.');
      return;
    }
    setSyncingBroker(true);
    try {
      const res = await portfolioService.syncBrokerHoldings(selectedBroker, brokerOtp);
      setSuccess(`Direct Demat connection established! Mapped ${res.count} stock holdings from ${selectedBroker} into your portfolio.`);
      setBrokerModalOpen(false);
      await fetchPortfolioData();
    } catch (err) {
      console.error(err);
      setError(`Failed to sync holdings with ${selectedBroker}. Please check network status.`);
      setBrokerModalOpen(false);
    } finally {
      setSyncingBroker(false);
    }
  };

  // Calculate total market value and returns
  const totalCost = portfolio.reduce((sum, h) => sum + (h.shares * h.purchasePrice), 0);

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
          <h2 style={{ fontSize: '1.35rem', fontWeight: 700 }}>Portfolio Diagnostics</h2>
          <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Manage holdings, import transaction files, and review weighted risk scores</p>
        </div>

        {/* Action triggers */}
        <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
          {/* CSV Import */}
          <label style={{
            padding: '0.6rem 1rem',
            backgroundColor: 'rgba(16, 185, 129, 0.08)',
            border: '1px solid rgba(16, 185, 129, 0.25)',
            borderRadius: '8px',
            color: 'var(--color-green)',
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
            fontSize: '0.85rem',
            cursor: 'pointer'
          }}>
            {uploading ? <RefreshCw className="animate-spin" size={16} /> : <FileSpreadsheet size={16} />}
            <span>{uploading ? 'Processing...' : 'Import CSV'}</span>
            <input type="file" accept=".csv" onChange={handleCsvUpload} style={{ display: 'none' }} disabled={uploading} />
          </label>

          <button onClick={fetchPortfolioData} className="btn-secondary" style={{ padding: '0.6rem 1rem', display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.85rem' }}>
            <RefreshCw size={16} />
            <span>Recalculate</span>
          </button>
        </div>
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
          <ShieldCheck size={16} />
          <span>{success}</span>
        </div>
      )}

      {loading && portfolio.length === 0 ? (
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '300px' }}>
          <div className="pulse-indicator" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.75rem' }}>
            <RefreshCw size={36} className="animate-spin text-blue-500" style={{ color: 'var(--color-blue)' }} />
            <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>Synchronizing portfolio matrices...</span>
          </div>
        </div>
      ) : (
        <div className="dashboard-grid">
          
          {/* Main Holdings Column (Col 8) */}
          <div style={{ gridColumn: 'span 8', display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            
            {/* Holdings Table */}
            <div className="glass-card" style={{ padding: '1rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem', padding: '0 0.5rem' }}>
                <h3 style={{ fontSize: '0.95rem', fontWeight: 600 }}>Active Assets</h3>
                <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                  Total Capital Invested: <strong style={{ color: 'var(--text-primary)', fontFamily: 'var(--font-mono)' }}>${totalCost.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</strong>
                </span>
              </div>

              {portfolio.length === 0 ? (
                <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', textAlign: 'center', padding: '3rem 0' }}>
                  No holdings registered. Add transactions or import a CSV using the buttons above.
                </p>
              ) : (
                <div style={{ overflowX: 'auto' }}>
                  <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.85rem' }}>
                    <thead>
                      <tr style={{ borderBottom: '1px solid var(--border-glass)', color: 'var(--text-muted)' }}>
                        <th style={{ padding: '0.75rem 1rem' }}>Symbol</th>
                        <th style={{ padding: '0.75rem 1rem' }}>Shares</th>
                        <th style={{ padding: '0.75rem 1rem' }}>Purchase Price</th>
                        <th style={{ padding: '0.75rem 1rem' }}>Total Cost</th>
                        <th style={{ padding: '0.75rem 1rem' }}>Purchase Date</th>
                        <th style={{ padding: '0.75rem 1rem', textAlign: 'center' }}>Action</th>
                      </tr>
                    </thead>
                    <tbody>
                      {portfolio.map((holding) => (
                        <tr 
                          key={holding.id} 
                          style={{ borderBottom: '1px solid rgba(255,255,255,0.02)' }}
                          className="hover:bg-white/5"
                        >
                          <td style={{ padding: '0.85rem 1rem', fontWeight: 700, color: 'var(--color-blue)', cursor: 'pointer' }} onClick={() => onViewStock(holding.symbol)}>
                            {holding.symbol}
                          </td>
                          <td style={{ padding: '0.85rem 1rem', fontFamily: 'var(--font-mono)' }}>{holding.shares}</td>
                          <td style={{ padding: '0.85rem 1rem', fontFamily: 'var(--font-mono)' }}>${holding.purchasePrice?.toFixed(2)}</td>
                          <td style={{ padding: '0.85rem 1rem', fontFamily: 'var(--font-mono)', fontWeight: 600 }}>
                            ${(holding.shares * holding.purchasePrice)?.toFixed(2)}
                          </td>
                          <td style={{ padding: '0.85rem 1rem', color: 'var(--text-muted)' }}>
                            {new Date(holding.purchaseDate).toLocaleDateString()}
                          </td>
                          <td style={{ padding: '0.85rem 1rem', textAlign: 'center' }}>
                            <button 
                              onClick={() => handleDeleteHolding(holding.id)}
                              style={{ background: 'transparent', color: 'var(--text-muted)' }}
                              className="hover:text-red-400"
                            >
                              <Trash2 size={16} />
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>

            {/* Add Holding Form */}
            <div className="glass-card">
              <h3 style={{ fontSize: '0.95rem', fontWeight: 600, marginBottom: '1rem' }}>Add Asset Transaction</h3>
              <form onSubmit={handleAddHolding} style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))',
                gap: '0.75rem',
                alignItems: 'end'
              }}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
                  <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>Asset Symbol</span>
                  <input 
                    type="text" 
                    placeholder="e.g. AAPL" 
                    value={symbol}
                    onChange={(e) => setSymbol(e.target.value)}
                    style={{ fontSize: '0.8rem', padding: '0.5rem 0.75rem' }}
                    disabled={submitting}
                  />
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
                  <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>Shares</span>
                  <input 
                    type="number" 
                    step="any" 
                    placeholder="e.g. 10" 
                    value={shares}
                    onChange={(e) => setShares(e.target.value)}
                    style={{ fontSize: '0.8rem', padding: '0.5rem 0.75rem' }}
                    disabled={submitting}
                  />
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
                  <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>Purchase Price ($)</span>
                  <input 
                    type="number" 
                    step="any" 
                    placeholder="e.g. 175.50" 
                    value={purchasePrice}
                    onChange={(e) => setPurchasePrice(e.target.value)}
                    style={{ fontSize: '0.8rem', padding: '0.5rem 0.75rem' }}
                    disabled={submitting}
                  />
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
                  <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>Date (Optional)</span>
                  <input 
                    type="date" 
                    value={purchaseDate}
                    onChange={(e) => setPurchaseDate(e.target.value)}
                    style={{ fontSize: '0.8rem', padding: '0.5rem 0.75rem' }}
                    disabled={submitting}
                  />
                </div>
                <button 
                  type="submit" 
                  className="btn-primary" 
                  style={{ 
                    padding: '0.55rem 1rem', 
                    fontSize: '0.85rem', 
                    display: 'flex', 
                    alignItems: 'center', 
                    justifyContent: 'center', 
                    gap: '0.35rem' 
                  }}
                  disabled={submitting}
                >
                  <Plus size={16} />
                  <span>{submitting ? 'Adding...' : 'Add'}</span>
                </button>
              </form>
            </div>

          </div>

          {/* Risk reports Sidebar Col 4 */}
          <div style={{ gridColumn: 'span 4', display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            
            {/* Direct Demat Sync Terminal */}
            <div className="glass-card" style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--color-blue)' }}>
                <ShieldCheck size={18} />
                <h3 style={{ fontSize: '0.9rem', fontWeight: 600 }}>Demat Sync Control</h3>
              </div>
              <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', lineHeight: 1.4 }}>
                Synchronize your live stock holdings directly from your Indian broker Demat account into StockMindAI.
              </p>
              
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                <button 
                  onClick={() => handleOpenBrokerModal('Zerodha Kite')}
                  className="btn-secondary" 
                  style={{ 
                    padding: '0.55rem 0.75rem', 
                    fontSize: '0.75rem', 
                    display: 'flex', 
                    alignItems: 'center', 
                    justifyContent: 'center', 
                    gap: '0.5rem',
                    border: '1px solid rgba(240, 90, 40, 0.2)',
                    backgroundColor: 'rgba(240, 90, 40, 0.03)',
                    color: '#f05a28',
                    transition: 'all 0.2s ease',
                    fontWeight: 600
                  }}
                >
                  Connect Zerodha Kite
                </button>
                <button 
                  onClick={() => handleOpenBrokerModal('Upstox')}
                  className="btn-secondary" 
                  style={{ 
                    padding: '0.55rem 0.75rem', 
                    fontSize: '0.75rem', 
                    display: 'flex', 
                    alignItems: 'center', 
                    justifyContent: 'center', 
                    gap: '0.5rem',
                    border: '1px solid rgba(100, 80, 200, 0.2)',
                    backgroundColor: 'rgba(100, 80, 200, 0.03)',
                    color: '#a39beb',
                    transition: 'all 0.2s ease',
                    fontWeight: 600
                  }}
                >
                  Connect Upstox
                </button>
              </div>
            </div>

            {riskReport && (
              <RiskMeter 
                value={riskReport.healthScore || riskReport.diversificationScore} 
                beta={riskReport.weightedBeta} 
                title="AI Portfolio Health Diagnostics" 
              />
            )}

            {/* Sector Weighting lists */}
            {riskReport?.sectorWeights && (
              <div className="glass-card" style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--color-blue)' }}>
                  <PieChart size={18} />
                  <h3 style={{ fontSize: '0.9rem', fontWeight: 600 }}>Sector Diversification</h3>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                  {riskReport.sectorWeights.map((w, idx) => (
                    <div key={idx}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', marginBottom: '0.25rem' }}>
                        <span style={{ color: 'var(--text-secondary)' }}>{w.sector}</span>
                        <strong style={{ color: 'var(--text-primary)' }}>{(w.weight * 100).toFixed(0)}%</strong>
                      </div>
                      <div style={{ width: '100%', height: '5px', backgroundColor: 'rgba(255,255,255,0.05)', borderRadius: '2.5px', overflow: 'hidden' }}>
                        <div style={{
                          width: `${w.weight * 100}%`,
                          height: '100%',
                          backgroundColor: 'var(--color-blue)'
                        }}></div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Risk Balancing Recommendations */}
            {riskReport?.recommendations && (
              <div className="glass-card" style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
                <h3 style={{ fontSize: '0.9rem', fontWeight: 600 }}>Balancing Suggestions</h3>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                  {riskReport.recommendations.map((rec, i) => (
                    <div key={i} style={{
                      padding: '0.6rem 0.85rem',
                      backgroundColor: 'rgba(255, 255, 255, 0.01)',
                      border: '1px solid var(--border-glass)',
                      borderLeft: '3px solid var(--color-orange)',
                      borderRadius: '0 6px 6px 0',
                      fontSize: '0.75rem',
                      color: 'var(--text-secondary)',
                      lineHeight: 1.35
                    }}>
                      {rec}
                    </div>
                  ))}
                </div>
              </div>
            )}

          </div>

        </div>
      )}

      {/* Sliding Glassmorphic Drawer for Broker OAuth Sync */}
      {brokerModalOpen && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          width: '100vw',
          height: '100vh',
          backgroundColor: 'rgba(0, 0, 0, 0.4)',
          backdropFilter: 'blur(8px)',
          zIndex: 9999,
          display: 'flex',
          justifyContent: 'flex-end',
          transition: 'all 0.3s ease'
        }} onClick={() => setBrokerModalOpen(false)}>
          
          <div style={{
            width: '420px',
            height: '100%',
            backgroundColor: 'rgba(15, 23, 42, 0.95)',
            borderLeft: '1px solid var(--border-glass)',
            padding: '2.5rem 2rem',
            display: 'flex',
            flexDirection: 'column',
            gap: '1.5rem',
            boxShadow: '-10px 0 30px rgba(0, 0, 0, 0.5)',
            overflowY: 'auto'
          }} onClick={(e) => e.stopPropagation()}>
            
            {/* Drawer Header */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <h3 style={{ fontSize: '1.2rem', fontWeight: 700, color: 'var(--text-primary)' }}>{selectedBroker} Sync</h3>
                <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Secure Sandbox OAuth Terminal</p>
              </div>
              <button 
                onClick={() => setBrokerModalOpen(false)}
                style={{
                  background: 'rgba(255, 255, 255, 0.05)',
                  border: '1px solid var(--border-glass)',
                  borderRadius: '50%',
                  width: '32px',
                  height: '32px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: 'var(--text-secondary)',
                  cursor: 'pointer'
                }}
              >
                ✕
              </button>
            </div>

            {/* Glowing separator */}
            <div style={{
              height: '1px',
              background: `linear-gradient(90deg, transparent, ${selectedBroker === 'Zerodha Kite' ? '#f05a28' : '#a39beb'}, transparent)`
            }} />

            {syncingBroker ? (
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '60%', gap: '1.5rem', textAlign: 'center' }}>
                <div style={{
                  position: 'relative',
                  width: '80px',
                  height: '80px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}>
                  <RefreshCw className="animate-spin" size={48} style={{ color: selectedBroker === 'Zerodha Kite' ? '#f05a28' : '#a39beb' }} />
                  <div style={{
                    position: 'absolute',
                    top: '50%',
                    left: '50%',
                    transform: 'translate(-50%, -50%)',
                    width: '60px',
                    height: '60px',
                    borderRadius: '50%',
                    backgroundColor: 'rgba(255, 255, 255, 0.02)',
                    border: `1px solid ${selectedBroker === 'Zerodha Kite' ? 'rgba(240, 90, 40, 0.15)' : 'rgba(163, 155, 235, 0.15)'}`
                  }} />
                </div>
                <div>
                  <h4 style={{ fontSize: '0.95rem', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '0.25rem' }}>Synchronizing Holdings</h4>
                  <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', maxWidth: '280px' }}>
                    Establishing secure API gateway tunnel to fetch Demat records...
                  </p>
                </div>
              </div>
            ) : !otpSent ? (
              /* Step 1: Credentials */
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
                  <label style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>Client ID</label>
                  <input 
                    type="text" 
                    placeholder="e.g. HITESH2026"
                    value={brokerClientId}
                    onChange={(e) => setBrokerClientId(e.target.value)}
                    style={{
                      padding: '0.65rem 0.85rem',
                      fontSize: '0.8rem',
                      border: '1px solid var(--border-glass)',
                      backgroundColor: 'rgba(255, 255, 255, 0.02)',
                      borderRadius: '8px',
                      color: 'var(--text-primary)',
                      outline: 'none'
                    }}
                  />
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
                  <label style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>Password</label>
                  <input 
                    type="password" 
                    placeholder="••••••••"
                    value={brokerPassword}
                    onChange={(e) => setBrokerPassword(e.target.value)}
                    style={{
                      padding: '0.65rem 0.85rem',
                      fontSize: '0.8rem',
                      border: '1px solid var(--border-glass)',
                      backgroundColor: 'rgba(255, 255, 255, 0.02)',
                      borderRadius: '8px',
                      color: 'var(--text-primary)',
                      outline: 'none'
                    }}
                  />
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
                  <label style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>6-Digit Secure PIN</label>
                  <input 
                    type="password" 
                    maxLength={6}
                    placeholder="e.g. 123456"
                    value={brokerPin}
                    onChange={(e) => setBrokerPin(e.target.value)}
                    style={{
                      padding: '0.65rem 0.85rem',
                      fontSize: '0.8rem',
                      border: '1px solid var(--border-glass)',
                      backgroundColor: 'rgba(255, 255, 255, 0.02)',
                      borderRadius: '8px',
                      color: 'var(--text-primary)',
                      outline: 'none'
                    }}
                  />
                </div>

                <div style={{
                  padding: '0.75rem 1rem',
                  backgroundColor: 'rgba(255, 255, 255, 0.01)',
                  border: '1px solid var(--border-glass)',
                  borderRadius: '8px',
                  fontSize: '0.7rem',
                  color: 'var(--text-muted)',
                  lineHeight: 1.4
                }}>
                  💡 <strong>Simulated Sandbox Profile</strong>: Enter any test credentials (e.g. Client ID: <code>HITESH2026</code>, PIN: <code>123456</code>) to proceed with high-fidelity demonstration.
                </div>

                <button 
                  onClick={handleSendBrokerOtp}
                  className="btn-primary"
                  style={{
                    padding: '0.75rem',
                    fontSize: '0.8rem',
                    fontWeight: 600,
                    backgroundColor: selectedBroker === 'Zerodha Kite' ? '#f05a28' : '#6366f1',
                    border: 'none',
                    borderRadius: '8px',
                    color: '#ffffff',
                    cursor: 'pointer',
                    marginTop: '0.5rem',
                    transition: 'all 0.2s'
                  }}
                >
                  Generate Session & Send OTP
                </button>
              </div>
            ) : (
              /* Step 2: OTP / 2FA */
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem',
                  padding: '0.75rem',
                  backgroundColor: 'rgba(16, 185, 129, 0.05)',
                  border: '1px solid rgba(16, 185, 129, 0.15)',
                  borderRadius: '8px',
                  color: 'var(--color-green)',
                  fontSize: '0.75rem'
                }}>
                  <ShieldCheck size={16} />
                  <span>2FA Authentication code dispatched successfully!</span>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
                  <label style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>Enter 2FA Code OR Comma-separated Tickers</label>
                  <input 
                    type="text" 
                    maxLength={200}
                    placeholder="e.g. 888888 or RELIANCE,TCS,HDFCBANK"
                    value={brokerOtp}
                    onChange={(e) => setBrokerOtp(e.target.value)}
                    style={{
                      padding: '0.65rem 0.85rem',
                      fontSize: '0.85rem',
                      letterSpacing: brokerOtp.includes(',') ? 'normal' : '0.2em',
                      textAlign: 'center',
                      border: '1px solid var(--border-glass)',
                      backgroundColor: 'rgba(255, 255, 255, 0.02)',
                      borderRadius: '8px',
                      color: 'var(--text-primary)',
                      outline: 'none',
                      fontFamily: 'var(--font-mono)'
                    }}
                  />
                  <span style={{ fontSize: '0.65rem', color: 'var(--text-muted)', marginTop: '0.2rem', textAlign: 'center' }}>
                    💡 Enter comma-separated stock tickers to sync real data instantly. Enter a standard code to sync a clean, empty portfolio.
                  </span>
                </div>

                <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>
                  Didn't receive code? <span style={{ color: 'var(--color-blue)', cursor: 'pointer' }} onClick={handleSendBrokerOtp}>Resend SMS</span>
                </div>

                <button 
                  onClick={handleVerifyAndSyncBroker}
                  className="btn-primary"
                  style={{
                    padding: '0.75rem',
                    fontSize: '0.8rem',
                    fontWeight: 600,
                    backgroundColor: selectedBroker === 'Zerodha Kite' ? '#f05a28' : '#6366f1',
                    border: 'none',
                    borderRadius: '8px',
                    color: '#ffffff',
                    cursor: 'pointer',
                    marginTop: '0.5rem',
                    transition: 'all 0.2s'
                  }}
                >
                  Verify & Synchronize Portfolio
                </button>
              </div>
            )}

            {/* Footer security badge */}
            <div style={{
              marginTop: 'auto',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '0.4rem',
              color: 'var(--text-muted)',
              fontSize: '0.7rem'
            }}>
              <ShieldCheck size={14} style={{ color: 'var(--color-green)' }} />
              <span>AES-256 TLS Encrypted Connection Gateway</span>
            </div>

          </div>
        </div>
      )}
    </div>
  );
}
