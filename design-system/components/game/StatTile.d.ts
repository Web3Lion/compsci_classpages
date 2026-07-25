import * as React from 'react';

/** Big number over a mono caption — the dashboard/arena stat strip. */
export interface StatTileProps extends React.HTMLAttributes<HTMLDivElement> {
  value: React.ReactNode;
  label: string;
  tone?: 'bright' | 'accent' | 'warn' | 'bad';
}
export declare function StatTile(props: StatTileProps): JSX.Element;
