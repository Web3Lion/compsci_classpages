import * as React from 'react';

/**
 * A course module rendered as a chained "block" — pulsing LED, diagonal link
 * notch, optional hash line. The signature card of the arena landing pages.
 * @startingPoint section="Game" subtitle="Chained module block cards" viewport="700x200"
 */
export interface ModuleBlockProps extends React.HTMLAttributes<HTMLDivElement> {
  index?: React.ReactNode;
  title: string;
  meta?: string;
  /** Faux content hash printed at the bottom — pure flavor. */
  hash?: string;
  /** Override the LED/link colour; defaults to the course accent. */
  accent?: string;
  /** Draws the diagonal link notch tying this block to the previous one. */
  chained?: boolean;
}
export declare function ModuleBlock(props: ModuleBlockProps): JSX.Element;
