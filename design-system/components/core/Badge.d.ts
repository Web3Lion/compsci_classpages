import * as React from 'react';

/** Small uppercase mono tag — difficulty, status, course, counts. */
export interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  /** ok = Easy · warn = Medium · bad = Hard · amber = hint/elective. */
  tone?: 'accent' | 'ok' | 'warn' | 'bad' | 'amber' | 'neutral';
  /** Fully rounded and roomier — the hero "STATUS: ENROLLED" treatment. */
  pill?: boolean;
}
export declare function Badge(props: BadgeProps): JSX.Element;
