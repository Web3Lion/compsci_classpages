import React from 'react';

const TONES = {
  accent: 'var(--accent)', ok: 'var(--ok)', warn: 'var(--warn)',
  bad: 'var(--bad)', amber: 'var(--amber)', neutral: 'var(--dim)'
};

export function Badge({ tone = 'accent', pill = false, style, children, ...rest }) {
  const c = TONES[tone] || TONES.accent;
  return (
    <span style={{
      fontFamily: 'var(--font-mono)',
      fontSize: 'var(--fs-mono-xs)',
      fontWeight: 'var(--fw-bold)',
      letterSpacing: 'var(--ls-pill)',
      textTransform: 'uppercase',
      padding: pill ? '8px 14px' : '3px 8px',
      borderRadius: pill ? 'var(--r-pill)' : 'var(--r-sm)',
      color: c,
      background: 'color-mix(in srgb, ' + c + ' 13%, transparent)',
      border: '1px solid color-mix(in srgb, ' + c + ' 40%, transparent)',
      display: 'inline-block',
      whiteSpace: 'nowrap',
      ...style
    }} {...rest}>{children}</span>
  );
}
