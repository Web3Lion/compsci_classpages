import * as React from 'react';

/** Labelled text field. Labels are uppercase mono; focus turns the border accent. */
export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  hint?: string;
  /** Replaces the hint with a red error message and reddens the border. */
  error?: string;
  /** Mono input text — for codes, hashes and flag answers. */
  mono?: boolean;
}
export declare function Input(props: InputProps): JSX.Element;
