import * as React from 'react';

/**
 * The platform's only button. Primary is the accent-filled call to action —
 * one per view. Ghost is for dismiss/secondary rows.
 * @startingPoint section="Core" subtitle="Button variants and sizes" viewport="700x150"
 */
export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'ghost' | 'danger';
  size?: 'sm' | 'md' | 'lg';
  /** Render the label in JetBrains Mono — used for terminal-flavored actions (LAUNCH, SUBMIT FLAG). */
  mono?: boolean;
}
export declare function Button(props: ButtonProps): JSX.Element;
