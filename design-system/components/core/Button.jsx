import React from 'react';

const VARIANTS = {
  primary:  { background: 'var(--accent)', borderColor: 'var(--accent)', color: 'var(--bg)' },
  secondary:{ background: 'var(--panel2)', borderColor: 'var(--border3)', color: 'var(--text)' },
  ghost:    { background: 'transparent',   borderColor: 'var(--border2)', color: 'var(--dim)'  },
  danger:   { background: 'var(--panel2)', borderColor: 'var(--border3)', color: 'var(--bad)'  }
};
const SIZES = {
  sm: { padding: '5px 10px', fontSize: '11px', borderRadius: 'var(--r-sm)' },
  md: { padding: '9px 15px', fontSize: '13px', borderRadius: 'var(--r-md)' },
  lg: { padding: '13px 22px', fontSize: '14px', borderRadius: 'var(--r-md)' }
};

export function Button({ variant = 'secondary', size = 'md', mono = false, disabled, style, children, ...rest }) {
  const [hover, setHover] = React.useState(false);
  const [down, setDown] = React.useState(false);
  const v = VARIANTS[variant] || VARIANTS.secondary;
  return (
    <button
      disabled={disabled}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => { setHover(false); setDown(false); }}
      onMouseDown={() => setDown(true)}
      onMouseUp={() => setDown(false)}
      style={{
        fontFamily: mono ? 'var(--font-mono)' : 'var(--font-ui)',
        fontWeight: 'var(--fw-semi)',
        border: '1px solid ' + v.borderColor,
        background: v.background,
        color: v.color,
        cursor: disabled ? 'not-allowed' : 'pointer',
        opacity: disabled ? 0.45 : 1,
        transition: 'var(--t-lift)',
        ...SIZES[size] || SIZES.md,
        ...(hover && !disabled ? {
          borderColor: variant === 'danger' ? 'var(--bad)' : 'var(--accent)',
          color: variant === 'primary' ? v.color : 'var(--bright)',
          boxShadow: 'var(--shadow-hover)'
        } : null),
        ...(down && !disabled ? { transform: 'translateY(2px) scale(.99)', boxShadow: 'var(--shadow-press)' } : null),
        ...style
      }}
      {...rest}
    >{children}</button>
  );
}
