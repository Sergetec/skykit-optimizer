import type { ReactNode } from 'react';

type PageShellProps = {
  children: ReactNode;
};

export function PageShell({ children }: PageShellProps) {
  return (
    <div className="min-h-screen bg-[radial-gradient(var(--color-grid)_1px,transparent_1px)] bg-[length:24px_24px] px-4 py-6 sm:px-8 lg:px-10">
      {children}
    </div>
  );
}

export default PageShell;
