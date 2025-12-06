import type { Language } from '../hooks/useLanguage';
import { pickLanguage } from '../i18n/utils';

type LanguageToggleProps = {
  language: Language;
  onToggle: () => void;
};

export function LanguageToggle({ language, onToggle }: LanguageToggleProps) {
  const isRomanian = language === 'ro';
  const ariaLabel = pickLanguage(language, {
    en: 'Switch website to Romanian',
    ro: 'Comută site-ul în limba engleză'
  });

  return (
    <button
      type="button"
      onClick={onToggle}
      aria-label={ariaLabel}
      className="flex items-center gap-1 rounded-full border border-border bg-panel/70 px-2 py-1 text-[11px] font-semibold uppercase tracking-[0.3em] text-text backdrop-blur transition-colors hover:bg-panel focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
    >
      <span className={`px-2 py-1 rounded-full ${!isRomanian ? 'bg-accent/20 text-accent' : 'text-text-muted'}`}>EN</span>
      <span className={`px-2 py-1 rounded-full ${isRomanian ? 'bg-accent/20 text-accent' : 'text-text-muted'}`}>RO</span>
    </button>
  );
}

export default LanguageToggle;
