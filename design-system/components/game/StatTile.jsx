import React from 'react';

export function StatTile({ value, label, tone = 'bright', style, ...rest }) {
  const COLORS = { bright: 'var(--bright)', accent: 'var(--accent)', warn: 'var(--warn)', bad: 'var(--bad)' };
  return (
    <div style={{
      background: 'var(--bg)', border: 'var(--stroke-quiet)',
      borderRadius: 'var(--r-md)', padding: '14px 16px', ...style
    }} {...rest}>
      <div style={{ fontSize: '26px', fontWeight: 'var(--fw-black)', lineHeight: 1, color: COLORS[tone] || COLORS.bright }}>{value}</div>
      <div style={{
        fontFamily: 'var(--font-mono)', fontSize: 'var(--fs-mono-sm)',
        letterSpacing: 'var(--ls-pill)', color: 'var(--dim)', marginTop: 'var(--sp-2)'
      }}>{label}</div>
    </div>
  );
}
