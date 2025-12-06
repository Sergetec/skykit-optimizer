import type { ReactNode } from 'react';
import { CursorTrail } from './CursorTrail';

const planePath = 'M24 2L28.5 14H42L37 24L42 34H28.5L24 46L19.5 34H6L11 24L6 14H19.5Z';
const trailPath = 'M4 24H16';
const flightPaths = [
  { id: 'alpha', className: 'flight-plane flight-plane--one', delay: '2s', color: 'var(--color-accent)' },
  { id: 'bravo', className: 'flight-plane flight-plane--two', delay: '8s', color: 'var(--color-accent-2)' },
  { id: 'charlie', className: 'flight-plane flight-plane--three', delay: '4s', color: 'var(--color-warning)' },
  { id: 'delta', className: 'flight-plane flight-plane--four', delay: '12s', color: 'rgba(255,255,255,0.65)' }
];

type PageShellProps = {
  children: ReactNode;
};

export function PageShell({ children }: PageShellProps) {
  return (
    <div className="relative min-h-screen bg-[radial-gradient(var(--color-grid)_1px,transparent_1px)] bg-[length:24px_24px] px-4 py-6 sm:px-8 lg:px-10">
      <CursorTrail />
      <div className="air-traffic" aria-hidden>
        {flightPaths.map(flight => (
          <svg
            key={flight.id}
            viewBox="0 0 48 48"
            className={flight.className}
            style={{ animationDelay: flight.delay, color: flight.color }}
          >
            <path d={planePath} />
            <path d={trailPath} className="trail" />
          </svg>
        ))}
      </div>
      <div className="ambient-layer" aria-hidden>
        <svg viewBox="0 0 48 48" className="ambient-plane ambient-plane--a">
          <path d={planePath} />
        </svg>
        <svg viewBox="0 0 48 48" className="ambient-plane ambient-plane--b">
          <path d={planePath} />
        </svg>
        <svg viewBox="0 0 48 48" className="ambient-plane ambient-plane--c">
          <path d={planePath} />
        </svg>

        <svg viewBox="0 0 32 48" className="ambient-fork ambient-fork--one">
          <path d="M12 2h2v9h2V2h2v9h2V2h2v12c0 2.2-1.8 4-4 4h-2v28h-4V18h-2c-2.2 0-4-1.8-4-4V2h2v9h2V2h2v9h2V2z" />
        </svg>
        <svg viewBox="0 0 32 48" className="ambient-fork ambient-fork--two">
          <path d="M12 2h2v9h2V2h2v9h2V2h2v12c0 2.2-1.8 4-4 4h-2v28h-4V18h-2c-2.2 0-4-1.8-4-4V2h2v9h2V2h2v9h2V2z" />
        </svg>
      </div>

      <div className="relative z-10">
        {children}
      </div>
    </div>
  );
}

export default PageShell;
