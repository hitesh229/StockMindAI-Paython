import React from 'react';
import { ShieldAlert, ShieldCheck, Activity } from 'lucide-react';

export default function RiskMeter({ value = 50, beta = 1.0, title = "Portfolio Health & Risk Score" }) {
  // value represents health score (0 = critically risky/low health, 100 = perfectly healthy/safe)
  // beta represents the portfolio's relative market volatility (1.0 = average market volatility)

  // Calculate coordinates for the meter needle (SVG Arc)
  const radius = 80;
  const strokeWidth = 14;
  const cx = 100;
  const cy = 100;
  
  // Map value (0-100) to an angle in radians/degrees
  // SVG arcs range from 180 degrees (left) to 0 degrees (right)
  const minAngle = 180;
  const maxAngle = 0;
  const angleRange = maxAngle - minAngle;
  const currentAngleDegrees = minAngle + (value / 100) * angleRange;
  const currentAngleRadians = (currentAngleDegrees * Math.PI) / 180;

  // Needle tip coordinates
  const needleLen = 65;
  const needleX = cx + needleLen * Math.cos(currentAngleRadians);
  const needleY = cy + needleLen * Math.sin(currentAngleRadians);

  // Determine risk category
  let riskLevel = 'Moderate';
  let riskColor = 'var(--color-orange)';
  let HealthIcon = Activity;

  if (value >= 80) {
    riskLevel = 'Excellent';
    riskColor = 'var(--color-green)';
    HealthIcon = ShieldCheck;
  } else if (value < 40) {
    riskLevel = 'High Risk Warning';
    riskColor = 'var(--color-red)';
    HealthIcon = ShieldAlert;
  }

  // Determine beta rating description
  let betaDesc = 'Neutral market exposure';
  if (beta > 1.3) betaDesc = 'Aggressive high-beta exposure';
  else if (beta < 0.7) betaDesc = 'Conservative defensive exposure';

  return (
    <div className="glass-card" style={{ display: 'flex', flexDirection: 'column', gap: '1rem', alignItems: 'center', justifyContent: 'center' }}>
      <h3 style={{ fontSize: '1rem', fontWeight: 600, width: '100%', textAlign: 'left' }}>{title}</h3>
      
      <div style={{ position: 'relative', width: '200px', height: '130px', margin: '0 auto' }}>
        <svg width="200" height="130" viewBox="0 0 200 130">
          <defs>
            <linearGradient id="gaugeGradient" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="var(--color-red)" />
              <stop offset="50%" stopColor="var(--color-orange)" />
              <stop offset="100%" stopColor="var(--color-green)" />
            </linearGradient>
            <filter id="glow">
              <feGaussianBlur stdDeviation="3" result="coloredBlur"/>
              <feMerge>
                <feMergeNode in="coloredBlur"/>
                <feMergeNode in="SourceGraphic"/>
              </feMerge>
            </filter>
          </defs>
          
          {/* Background Track Arc */}
          <path
            d="M 20 100 A 80 80 0 0 1 180 100"
            fill="none"
            stroke="rgba(255, 255, 255, 0.05)"
            strokeWidth={strokeWidth}
            strokeLinecap="round"
          />

          {/* Color Arc Gradient */}
          <path
            d="M 20 100 A 80 80 0 0 1 180 100"
            fill="none"
            stroke="url(#gaugeGradient)"
            strokeWidth={strokeWidth}
            strokeLinecap="round"
          />

          {/* Needle Center Pin */}
          <circle cx={cx} cy={cy} r="8" fill="var(--text-primary)" />
          <circle cx={cx} cy={cy} r="4" fill="var(--bg-dark)" />

          {/* Needle Line */}
          <line
            x1={cx}
            y1={cy}
            x2={needleX}
            y2={needleY}
            stroke="var(--text-primary)"
            strokeWidth="3"
            strokeLinecap="round"
            filter="url(#glow)"
          />
        </svg>

        {/* Big visual indicator value overlay */}
        <div style={{
          position: 'absolute',
          bottom: '10px',
          left: 0,
          right: 0,
          textAlign: 'center',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center'
        }}>
          <span style={{ fontSize: '1.75rem', fontWeight: 700, lineHeight: 1 }}>{value}%</span>
          <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '4px' }}>Health Index</span>
        </div>
      </div>

      {/* Meta Diagnostics Info Grid */}
      <div style={{
        width: '100%',
        display: 'grid',
        gridTemplateColumns: '1fr 1fr',
        gap: '0.75rem',
        borderTop: '1px solid var(--border-glass)',
        paddingTop: '1rem',
      }}>
        {/* Rating Category */}
        <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
          <div style={{
            padding: '0.4rem',
            backgroundColor: 'rgba(255, 255, 255, 0.02)',
            borderRadius: '6px',
            color: riskColor,
            display: 'flex',
            alignItems: 'center'
          }}>
            <HealthIcon size={16} />
          </div>
          <div>
            <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)', display: 'block' }}>Rating Status</span>
            <span style={{ fontSize: '0.8rem', fontWeight: 600, color: riskColor }}>{riskLevel}</span>
          </div>
        </div>

        {/* Beta Value */}
        <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
          <div style={{
            padding: '0.4rem',
            backgroundColor: 'rgba(255, 255, 255, 0.02)',
            borderRadius: '6px',
            color: 'var(--color-blue)',
            display: 'flex',
            alignItems: 'center'
          }}>
            <Activity size={16} />
          </div>
          <div>
            <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)', display: 'block' }}>Portfolio Beta</span>
            <span style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-primary)' }}>{beta?.toFixed(2)}</span>
          </div>
        </div>
      </div>

      <p style={{
        fontSize: '0.75rem',
        color: 'var(--text-muted)',
        textAlign: 'center',
        marginTop: '0.25rem',
        lineHeight: 1.3
      }}>
        {betaDesc}
      </p>
    </div>
  );
}
