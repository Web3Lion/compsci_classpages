import * as React from 'react';

export interface DataTableColumn<T = any> {
  header: string;
  key?: string;
  align?: 'left' | 'right' | 'center';
  cell?: (row: T) => React.ReactNode;
}

/**
 * Roster / flag-capture / integrity table. Mono uppercase heads, hairline row rules.
 * @startingPoint section="Game" subtitle="Roster and event tables" viewport="700x260"
 */
export interface DataTableProps<T = any> extends React.HTMLAttributes<HTMLDivElement> {
  columns: DataTableColumn<T>[];
  rows: T[];
  empty?: string;
}
export declare function DataTable<T = any>(props: DataTableProps<T>): JSX.Element;
