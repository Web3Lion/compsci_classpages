import React from 'react';

export function Input({ label, hint, error, mono = false, style, ...rest }) {
  const [focus, setFocus] = React.useState(false);
  return (
    <label style={{ display: 'block' }}>
      {label && (
        <div style={{
          fontFamily: 'var(--font-mono)', fontSize: 'var(--fs-mono-xs)',
          letterSpacing: 'var(--ls-label)', color: 'var(--faint)',
          textTransform: 'uppercase', marginBottom: 'var(--sp-2)'
        }}>{label}</div>
      )}
      <input
        onFocus={() => setFocus(true)}
        onBlur={() => setFocus(false)}
        style={{
          width: '100%', padding: '10px 12px', borderRadius: 'var(--r-md)',
          border: '1px solid ' + (error ? 'var(--bad)' : focus ? 'var(--accent)' : 'var(--border3)'),
          background: 'var(--bg)', color: 'var(--bright)',
          fontFamily: mono ? 'var(--font-mono)' : 'var(--font-ui)',
          fontSize: 'var(--fs-sm)', outline: 'none', transition: 'var(--t-theme)',
          ...style
        }}
        {...rest}
      />
      {(error || hint) && (
        <div style={{
          fontSize: 'var(--fs-mono)', marginTop: 'var(--sp-2)',
          color: error ? 'var(--bad)' : 'var(--dim)'
        }}>{error || hint}</div>
      )}
    </label>
  );
}
