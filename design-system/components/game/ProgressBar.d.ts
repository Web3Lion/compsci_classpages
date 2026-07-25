import * as React from 'react';

/** Module/course completion bar — accent gradient fill with a soft glow. */
export interface ProgressBarProps extends React.HTMLAttributes<HTMLDivElement> {
  value?: number;
  max?: number;
  label?: string;
  showPct?: boolean;
  height?: number;
}
export declare function ProgressBar(props: ProgressBarProps): JSX.Element;
