import * as React from 'react';

/** Pulsing-LED status line above a hero heading — the platform's "system is live" motif. */
export interface TelemetryStripProps extends React.HTMLAttributes<HTMLDivElement> {
  status?: string;
  /** Extra mono chips: build tags, revisions, sync state. */
  items?: string[];
}
export declare function TelemetryStrip(props: TelemetryStripProps): JSX.Element;
