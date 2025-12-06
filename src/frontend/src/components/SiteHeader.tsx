import type { ReactNode } from 'react';
import { ThemeToggle } from './ThemeToggle';
import { LanguageToggle } from './LanguageToggle';
import type { Theme } from '../hooks/useTheme';
import type { Language } from '../hooks/useLanguage';
import { pickLanguage } from '../i18n/utils';

type SiteHeaderProps = {
  isConnected: boolean;
  theme: Theme;
  onToggleTheme: () => void;
  language: Language;
  onToggleLanguage: () => void;
  rightSlot?: ReactNode;
};

export function SiteHeader({ isConnected, theme, onToggleTheme, language, onToggleLanguage, rightSlot }: SiteHeaderProps) {
  const subtitle = pickLanguage(language, { en: 'SkyKit Optimizer', ro: 'SkyKit Optimizer' });
  const title = pickLanguage(language, { en: 'Rotable Kit Logistics Optimizer', ro: 'Optimizator logistic pentru kituri rotabile' });
  const connectionText = pickLanguage(language, { en: 'Connected to backend', ro: 'Conectat la backend' });
  const disconnectedText = pickLanguage(language, { en: 'Disconnected', ro: 'Deconectat' });

  return (
    <header className="flex justify-between items-center gap-4 mb-6 flex-wrap">
      <div className="flex items-center gap-4">
        <span className="text-3xl text-accent">◆</span>
        <div>
          <p className="uppercase tracking-[0.2em] text-xs text-text-muted mb-0.5">{subtitle}</p>
          <h1 className="m-0 text-xl">{title}</h1>
        </div>
      </div>
      <div className="flex items-center gap-4 flex-wrap justify-end">
        {rightSlot}
        <LanguageToggle language={language} onToggle={onToggleLanguage} />
        <ThemeToggle theme={theme} onToggle={onToggleTheme} language={language} />
        <div className="flex items-center gap-2">
          <div className={`w-2.5 h-2.5 rounded-full ${isConnected ? 'bg-success animate-pulse-opacity' : 'bg-text-muted'}`} />
          <span className="text-text-muted text-sm">
            {isConnected ? connectionText : disconnectedText}
          </span>
        </div>
      </div>
    </header>
  );
}

export default SiteHeader;
