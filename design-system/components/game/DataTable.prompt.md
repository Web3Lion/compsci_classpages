Dense data table used across the teacher dashboard. Uppercase mono heads, `--border2` row rules, built-in empty state.

```jsx
<DataTable
  columns={[{ header: 'Handle', key: 'handle' },
            { header: 'XP', cell: r => <b style={{color:'var(--accent)'}}>{r.xp}</b> }]}
  rows={roster} empty="No students have joined yet." />
```
