import React, { useRef, useEffect, useState } from 'react';

export default function StockChart({ history, symbol }) {
  const canvasRef = useRef(null);
  const [hoverData, setHoverData] = useState(null);
  const [mouseX, setMouseX] = useState(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || !history || history.length === 0) return;

    const ctx = canvas.getContext('2d');
    const dpr = window.devicePixelRatio || 1;
    
    // Set size respecting high-DPI displays
    const rect = canvas.getBoundingClientRect();
    canvas.width = rect.width * dpr;
    canvas.height = rect.height * dpr;
    ctx.scale(dpr, dpr);

    const width = rect.width;
    const height = rect.height;

    // Clear background
    ctx.fillStyle = '#0b0f19';
    ctx.fillRect(0, 0, width, height);

    // Padding parameters
    const padLeft = 20;
    const padRight = 60;
    const padTop = 30;
    const padBottom = 40;
    
    const chartW = width - padLeft - padRight;
    const chartH = height - padTop - padBottom;

    // Filter historical points
    const points = history;
    const n = points.length;

    // Find Min and Max prices for scaling
    let maxPrice = -Infinity;
    let minPrice = Infinity;
    let maxVol = 0;

    points.forEach(p => {
      // Main chart price metrics
      const vals = [p.close, p.high, p.low, p.bb_upper, p.bb_lower, p.sma_50, p.sma_200];
      vals.forEach(v => {
        if (v !== undefined && v !== null) {
          if (v > maxPrice) maxPrice = v;
          if (v < minPrice) minPrice = v;
        }
      });
      if (p.volume > maxVol) maxVol = p.volume;
    });

    // Add padding to margins
    const priceDiff = maxPrice - minPrice;
    maxPrice += priceDiff * 0.1;
    minPrice -= priceDiff * 0.1;
    if (minPrice < 0) minPrice = 0;

    // Scaling helpers
    const getX = (i) => padLeft + (i / (n - 1)) * chartW;
    const getY = (price) => padTop + chartH - ((price - minPrice) / (maxPrice - minPrice)) * chartH;

    // 1. Draw Grid Lines & Y-Axis Scale
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.04)';
    ctx.lineWidth = 1;
    ctx.fillStyle = '#6b7280';
    ctx.font = '10px monospace';
    
    const numGridY = 5;
    for (let i = 0; i <= numGridY; i++) {
      const price = minPrice + (i / numGridY) * (maxPrice - minPrice);
      const y = getY(price);
      
      // Draw horizontal grid line
      ctx.beginPath();
      ctx.moveTo(padLeft, y);
      ctx.lineTo(width - padRight, y);
      ctx.stroke();

      // Draw price label
      ctx.fillText(`$${price.toFixed(2)}`, width - padRight + 8, y + 4);
    }

    // 2. Draw Date X-Axis
    const dateInterval = Math.max(1, Math.floor(n / 5));
    points.forEach((p, i) => {
      if (i % dateInterval === 0 || i === n - 1) {
        const x = getX(i);
        // vertical grid line
        ctx.beginPath();
        ctx.moveTo(x, padTop);
        ctx.lineTo(x, padTop + chartH);
        ctx.stroke();

        // format date string
        const dateStr = p.date.substring(5); // e.g. "05-21"
        ctx.fillText(dateStr, x - 15, padTop + chartH + 18);
      }
    });

    // 3. Draw Bollinger Bands (Translucent Shading Area)
    ctx.fillStyle = 'rgba(59, 130, 246, 0.03)';
    ctx.beginPath();
    points.forEach((p, i) => {
      const x = getX(i);
      const y = getY(p.bb_upper || p.close);
      if (i === 0) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    });
    // Loop back on lower band to close polygon
    for (let i = n - 1; i >= 0; i--) {
      const x = getX(i);
      const y = getY(points[i].bb_lower || points[i].close);
      ctx.lineTo(x, y);
    }
    ctx.fill();

    // Draw Bollinger Bands boundary lines
    ctx.lineWidth = 1;
    ctx.setLineDash([3, 3]);
    
    // Upper BB
    ctx.strokeStyle = 'rgba(59, 130, 246, 0.25)';
    ctx.beginPath();
    points.forEach((p, i) => {
      if (i === 0) ctx.moveTo(getX(i), getY(p.bb_upper || p.close));
      else ctx.lineTo(getX(i), getY(p.bb_upper || p.close));
    });
    ctx.stroke();

    // Lower BB
    ctx.beginPath();
    points.forEach((p, i) => {
      if (i === 0) ctx.moveTo(getX(i), getY(p.bb_lower || p.close));
      else ctx.lineTo(getX(i), getY(p.bb_lower || p.close));
    });
    ctx.stroke();
    ctx.setLineDash([]); // Reset line dash

    // 4. Draw Volume Bars (Translucent bars at bottom 20% of chart)
    points.forEach((p, i) => {
      const x = getX(i);
      const barW = Math.max(1.5, (chartW / n) * 0.75);
      const barH = (p.volume / (maxVol || 1)) * (chartH * 0.18);
      const y = padTop + chartH - barH;

      ctx.fillStyle = p.close >= p.open ? 'rgba(16, 185, 129, 0.12)' : 'rgba(239, 68, 68, 0.12)';
      ctx.fillRect(x - barW / 2, y, barW, barH);
    });

    // 5. Draw Technical Indicators - SMA 50 (Blue) and SMA 200 (Orange)
    ctx.lineWidth = 1.5;
    
    // SMA 50
    ctx.strokeStyle = 'rgba(59, 130, 246, 0.8)'; // Electric Blue
    ctx.beginPath();
    points.forEach((p, i) => {
      if (i === 0) ctx.moveTo(getX(i), getY(p.sma_50 || p.close));
      else ctx.lineTo(getX(i), getY(p.sma_50 || p.close));
    });
    ctx.stroke();

    // SMA 200
    ctx.strokeStyle = 'rgba(245, 158, 11, 0.7)'; // Amber Orange
    ctx.beginPath();
    points.forEach((p, i) => {
      if (i === 0) ctx.moveTo(getX(i), getY(p.sma_200 || p.close));
      else ctx.lineTo(getX(i), getY(p.sma_200 || p.close));
    });
    ctx.stroke();

    // 6. Draw Candlesticks (Green for positive returns, Red for negative returns)
    points.forEach((p, i) => {
      const x = getX(i);
      const yOpen = getY(p.open || p.close);
      const yClose = getY(p.close);
      const yHigh = getY(p.high || p.close);
      const yLow = getY(p.low || p.close);

      const isBullish = p.close >= (p.open || p.close);
      const color = isBullish ? '#10b981' : '#ef4444';
      ctx.strokeStyle = color;
      ctx.fillStyle = color;
      ctx.lineWidth = 1.5;

      // Draw shadow wick line
      ctx.beginPath();
      ctx.moveTo(x, yHigh);
      ctx.lineTo(x, yLow);
      ctx.stroke();

      // Draw solid candle body
      const candleW = Math.max(3, (chartW / n) * 0.7);
      const bodyH = Math.max(1, Math.abs(yClose - yOpen));
      ctx.fillRect(x - candleW / 2, Math.min(yOpen, yClose), candleW, bodyH);
    });

    // 7. Render Hover Crosshair & Trigger Data Update
    if (mouseX !== null) {
      // Find closest point index
      const relativeX = mouseX - padLeft;
      const idx = Math.min(n - 1, Math.max(0, Math.round((relativeX / chartW) * (n - 1))));
      const pt = points[idx];
      
      const x = getX(idx);
      
      // Draw vertical crosshair line
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.15)';
      ctx.lineWidth = 1;
      ctx.setLineDash([4, 4]);
      
      ctx.beginPath();
      ctx.moveTo(x, padTop);
      ctx.lineTo(x, padTop + chartH);
      ctx.stroke();

      // Draw horizontal line at close price
      const y = getY(pt.close);
      ctx.beginPath();
      ctx.moveTo(padLeft, y);
      ctx.lineTo(width - padRight, y);
      ctx.stroke();
      ctx.setLineDash([]); // reset

      // Draw pulsing center dot
      ctx.fillStyle = '#3b82f6';
      ctx.beginPath();
      ctx.arc(x, y, 5, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = '#ffffff';
      ctx.lineWidth = 1.5;
      ctx.stroke();

      // Update Hover tooltip state
      if (!hoverData || hoverData.date !== pt.date) {
        setHoverData(pt);
      }
    } else {
      if (hoverData) setHoverData(null);
    }
  }, [history, mouseX]);

  const handleMouseMove = (e) => {
    const rect = canvasRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    setMouseX(x);
  };

  const handleMouseLeave = () => {
    setMouseX(null);
    setHoverData(null);
  };

  // Default display values if not hovering (use latest data point)
  const displayPt = hoverData || (history && history.length > 0 ? history[history.length - 1] : null);

  return (
    <div className="glass-card" style={{ display: 'flex', flexDirection: 'column', gap: '1rem', height: '420px' }}>
      {/* Chart Headers */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h3 style={{ fontSize: '1rem', fontWeight: 600 }}>{symbol} Interactive Candlestick</h3>
          <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Hover chart to inspect parameters & technical values</p>
        </div>

        {/* Live coordinate metrics board */}
        {displayPt && (
          <div style={{ display: 'flex', gap: '1rem', fontSize: '0.8rem', fontFamily: 'var(--font-mono)' }}>
            <div>
              <span style={{ color: 'var(--text-muted)' }}>O:</span>
              <span style={{ color: displayPt.close >= displayPt.open ? 'var(--color-green)' : 'var(--color-red)', marginLeft: '4px' }}>
                ${displayPt.open?.toFixed(2)}
              </span>
            </div>
            <div>
              <span style={{ color: 'var(--text-muted)' }}>H:</span>
              <span style={{ color: 'var(--text-primary)', marginLeft: '4px' }}>${displayPt.high?.toFixed(2)}</span>
            </div>
            <div>
              <span style={{ color: 'var(--text-muted)' }}>L:</span>
              <span style={{ color: 'var(--text-primary)', marginLeft: '4px' }}>${displayPt.low?.toFixed(2)}</span>
            </div>
            <div>
              <span style={{ color: 'var(--text-muted)' }}>C:</span>
              <span style={{ color: displayPt.close >= displayPt.open ? 'var(--color-green)' : 'var(--color-red)', marginLeft: '4px' }}>
                ${displayPt.close?.toFixed(2)}
              </span>
            </div>
            <div style={{ display: 'none' /* mobile hidden */ }}>
              <span style={{ color: 'var(--text-muted)' }}>RSI:</span>
              <span style={{ color: 'var(--color-orange)', marginLeft: '4px' }}>{displayPt.rsi?.toFixed(1)}</span>
            </div>
          </div>
        )}
      </div>

      {/* Chart Canvas */}
      <div style={{ flex: 1, position: 'relative' }}>
        <canvas
          ref={canvasRef}
          onMouseMove={handleMouseMove}
          onMouseLeave={handleMouseLeave}
          style={{ width: '100%', height: '100%', cursor: 'crosshair', display: 'block' }}
        />
      </div>

      {/* Dynamic technical legend details */}
      {displayPt && (
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          fontSize: '0.75rem',
          color: 'var(--text-secondary)',
          borderTop: '1px solid var(--border-glass)',
          paddingTop: '0.5rem',
        }}>
          <div>
            <span style={{ display: 'inline-block', width: '8px', height: '8px', backgroundColor: 'rgba(59, 130, 246, 0.8)', borderRadius: '50%', marginRight: '6px' }}></span>
            <span>SMA 50: <strong>${displayPt.sma_50?.toFixed(2)}</strong></span>
          </div>
          <div>
            <span style={{ display: 'inline-block', width: '8px', height: '8px', backgroundColor: 'rgba(245, 158, 11, 0.7)', borderRadius: '50%', marginRight: '6px' }}></span>
            <span>SMA 200: <strong>${displayPt.sma_200?.toFixed(2)}</strong></span>
          </div>
          <div>
            <span style={{ display: 'inline-block', width: '8px', height: '8px', backgroundColor: 'rgba(59, 130, 246, 0.25)', borderRadius: '50%', marginRight: '6px' }}></span>
            <span>Bollinger Bands Middle: <strong>${displayPt.bb_middle?.toFixed(2)}</strong></span>
          </div>
          <div>
            <span style={{ color: 'var(--text-muted)' }}>Date:</span> <strong style={{ color: 'var(--text-primary)' }}>{displayPt.date}</strong>
          </div>
        </div>
      )}
    </div>
  );
}
