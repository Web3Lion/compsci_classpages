import * as React from 'react';

/**
 * The platform's container. Standard sits on the page; inner nests inside a
 * standard card and steps its surface DOWN, not up.
 * @startingPoint section="Core" subtitle="Card levels and hover lift" viewport="700x230"
 */
export interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  level?: 'standard' | 'inner' | 'feature';
  /** Adds the lift + accent ring on hover. Use for anything clickable. */
  interactive?: boolean;
}
export declare function Card(props: CardProps): JSX.Element;
