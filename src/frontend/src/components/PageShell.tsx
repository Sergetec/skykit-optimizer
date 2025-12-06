import type { ReactNode } from 'react';
import { CursorTrail } from './CursorTrail';

type PageShellProps = {
  children: ReactNode;
};

export function PageShell({ children }: PageShellProps) {
  return (
    <div className="relative min-h-screen bg-[radial-gradient(var(--color-grid)_1px,transparent_1px)] bg-[length:24px_24px] px-4 py-6 sm:px-8 lg:px-10">
      <CursorTrail />
      {children}
    </div>
  );
}

export default PageShell;
