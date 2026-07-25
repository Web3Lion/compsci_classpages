import React from 'react';

export function Card({ level = 'standard', interactive = false, style, children, ...rest }) {
  const [hover, setHover] = React.useState(false);
  const LEVELS = {
    standard: { background: 'var(--panel)', border: 'var(--stroke)',       borderRadius: 'var(--r-lg)', padding: 'var(--sp-11)' },
    inner:    { background: 'var(--bg)',    border: 'var(--stroke-quiet)', borderRadius: 'var(--r-md)', padding: 'var(--sp-8)' },
    feature:  { background: 'linear-gradient(158deg, var(--panel2), var(--panel))', border: 'var(--stroke)', borderRadius: 'var(--r-xl)', padding: 'var(--sp-10)' }
  };
  return (
    <div
      onMouseEnter={() => interactive && setHover(true)}
      onMouseLeave={() => interactive && setHover(false)}
      style={{
        transition: 'var(--t-lift)',
        ...LEVELS[level] || LEVELS.standard,
        ...(hover ? { transform: 'translateY(-3px)', borderColor: 'var(--accent)', boxShadow: 'var(--shadow-ring), var(--shadow-lift)' } : null),
        ...style
      }}
      {...rest}
    >{children}</div>
  );
}
