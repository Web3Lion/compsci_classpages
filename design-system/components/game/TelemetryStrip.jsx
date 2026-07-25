import React from 'react';

export function TelemetryStrip({ status = 'NODE ONLINE', items = [], style, ...rest }) {
  return (
    <div style={{
      fontFamily: 'var(--font-mono)', display: 'flex', gap: 'var(--sp-7)',
      flexWrap: 'wrap', alignItems: 'center', fontSize: 'var(--fs-mono-sm)',
      letterSpacing: '1px', color: 'var(--faint)', ...style
    }} {...rest}>
      <span style={{ display: 'inline-flex', alignItems: 'center', gap: 7 }}>
        <span style={{
          width: 8, height: 8, borderRadius: '50%', background: 'var(--accent)',
          boxShadow: 'var(--glow-sm)', animation: 'led 1.5s ease-in-out infinite'
        }} />
        {status}
      </span>
      {items.map((t, i) => <span key={i}>{t}</span>)}
    </div>
  );
}
