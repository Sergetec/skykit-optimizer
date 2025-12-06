import type { ReactNode } from 'react';
import { ThemeToggle } from './ThemeToggle';
import type { Theme } from '../hooks/useTheme';

type SiteHeaderProps = {
  isConnected: boolean;
  theme: Theme;
  onToggleTheme: () => void;
  rightSlot?: ReactNode;
};

export function SiteHeader({ isConnected, theme, onToggleTheme, rightSlot }: SiteHeaderProps) {
  return (
    <header className="flex justify-between items-center gap-4 mb-6 flex-wrap">
      <div className="flex items-center gap-4">
        <span className="text-3xl text-accent">◆</span>
        <div>
          <p className="uppercase tracking-[0.2em] text-xs text-text-muted mb-0.5">SkyKit Optimizer</p>
          <h1 className="m-0 text-xl">Rotable Kit Logistics Optimizer</h1>
        </div>
      </div>
      <div className="flex items-center gap-4 flex-wrap justify-end">
        {rightSlot}
        <ThemeToggle theme={theme} onToggle={onToggleTheme} />
        <div className="flex items-center gap-2">
          <div className={`w-2.5 h-2.5 rounded-full ${isConnected ? 'bg-success animate-pulse-opacity' : 'bg-text-muted'}`} />
          <span className="text-text-muted text-sm">
            {isConnected ? 'Connected to backend' : 'Disconnected'}
          </span>
        </div>
      </div>
    </header>
  );
}

export default SiteHeader;
