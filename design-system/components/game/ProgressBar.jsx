import React from 'react';

export function ProgressBar({ value = 0, max = 100, label, showPct = true, height = 8, style, ...rest }) {
  const pct = Math.max(0, Math.min(100, max ? (value / max) * 100 : 0));
  return (
    <div style={style} {...rest}>
      {(label || showPct) && (
        <div style={{
          display: 'flex', justifyContent: 'space-between', alignItems: 'baseline',
          fontFamily: 'var(--font-mono)', fontSize: 'var(--fs-mono-sm)',
          color: 'var(--dim)', marginBottom: 'var(--sp-2)'
        }}>
          <span>{label}</span>
          {showPct && <span style={{ color: 'var(--accent)', fontWeight: 'var(--fw-bold)' }}>{Math.round(pct)}%</span>}
        </div>
      )}
      <div style={{ height, background: 'var(--bg)', border: 'var(--stroke-quiet)', borderRadius: 'var(--r-pill)', overflow: 'hidden' }}>
        <div style={{
          width: pct + '%', height: '100%',
          background: 'linear-gradient(90deg, var(--accent), var(--accent2))',
          boxShadow: 'var(--glow-sm)', transition: 'width .4s ease'
        }} />
      </div>
    </div>
  );
}
