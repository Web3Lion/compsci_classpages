import React from 'react';

export function ModuleBlock({ index, title, meta, hash, accent, chained = false, style, children, ...rest }) {
  const [hover, setHover] = React.useState(false);
  const cc = accent || 'var(--accent)';
  return (
    <div
      onMouseEnter={() => setHover(true)} onMouseLeave={() => setHover(false)}
      style={{
        position: 'relative', overflow: 'hidden', padding: 'var(--sp-7)',
        background: 'linear-gradient(158deg, var(--panel2), var(--panel))',
        border: 'var(--stroke-quiet)', borderRadius: 'var(--r-md)',
        transition: 'var(--t-lift)',
        ...(hover ? { transform: 'translateY(-3px)', borderColor: cc, boxShadow: '0 0 0 1px ' + cc + ', 0 16px 36px -18px ' + cc } : null),
        ...style
      }}
      {...rest}
    >
      {chained && <span style={{
        position: 'absolute', left: -7, top: '50%', width: 14, height: 14, marginTop: -7,
        borderRadius: 3, border: '1px solid ' + cc, background: 'var(--panel)', transform: 'rotate(45deg)'
      }} />}
      <span style={{
        position: 'absolute', top: 13, right: 13, width: 8, height: 8, borderRadius: '50%',
        background: cc, boxShadow: '0 0 9px ' + cc, animation: 'led 1.9s ease-in-out infinite'
      }} />
      {index != null && <div style={{
        fontFamily: 'var(--font-mono)', fontSize: 'var(--fs-mono-xs)',
        letterSpacing: 'var(--ls-label)', color: 'var(--faint)'
      }}>{index}</div>}
      <div style={{ fontFamily: 'var(--font-mono)', fontWeight: 'var(--fw-bold)', fontSize: '15px', color: 'var(--bright)', marginTop: 4 }}>{title}</div>
      {meta && <div style={{ fontSize: 'var(--fs-xs)', color: 'var(--muted)', marginTop: 6, lineHeight: 1.5 }}>{meta}</div>}
      {children}
      {hash && <div style={{
        fontFamily: 'var(--font-mono)', fontSize: 'var(--fs-mono-xs)',
        color: 'var(--faint)', letterSpacing: '.5px', marginTop: 10, wordBreak: 'break-all'
      }}>{hash}</div>}
    </div>
  );
}
