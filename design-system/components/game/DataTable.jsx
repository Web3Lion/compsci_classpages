import React from 'react';

export function DataTable({ columns = [], rows = [], empty = 'Nothing here yet.', style, ...rest }) {
  if (!rows.length) {
    return <div style={{ padding: '48px 20px', textAlign: 'center', color: 'var(--dim)', fontSize: 'var(--fs-sm)' }}>{empty}</div>;
  }
  return (
    <div style={{ overflow: 'auto', ...style }} {...rest}>
      <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 'var(--fs-xs)' }}>
        <thead><tr>
          {columns.map((c, i) => (
            <th key={i} style={{
              textAlign: c.align || 'left', fontFamily: 'var(--font-mono)',
              fontSize: 'var(--fs-mono-xs)', letterSpacing: '1px', color: 'var(--faint)',
              textTransform: 'uppercase', padding: '10px 12px',
              borderBottom: 'var(--stroke)', whiteSpace: 'nowrap'
            }}>{c.header}</th>
          ))}
        </tr></thead>
        <tbody>
          {rows.map((r, ri) => (
            <tr key={ri}>
              {columns.map((c, ci) => (
                <td key={ci} style={{
                  padding: '11px 12px', borderBottom: 'var(--stroke-quiet)',
                  verticalAlign: 'middle', textAlign: c.align || 'left'
                }}>{c.cell ? c.cell(r) : r[c.key]}</td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
