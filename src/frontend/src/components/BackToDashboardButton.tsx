import { useNavigate } from 'react-router-dom';
import type { Theme } from '../hooks/useTheme';
import type { Language } from '../hooks/useLanguage';
import { pickLanguage } from '../i18n/utils';

type BackToDashboardButtonProps = {
  theme: Theme;
  language: Language;
  className?: string;
};

const baseClass = 'cursor-pointer inline-flex items-center justify-center rounded-full px-4 py-2 text-xs font-semibold uppercase tracking-[0.2em] transition focus:outline-none focus:ring-2 focus:ring-accent focus:ring-offset-2 focus:ring-offset-transparent';
const darkVariant = 'border border-[#3b82f6]/70 text-[#cfe0ff] shadow-[0_0_18px_rgba(56,189,248,0.25)] hover:border-[#7dd3fc] hover:text-white';
const lightVariant = 'border border-border text-text-muted hover:text-text hover:border-accent';

export function BackToDashboardButton({ theme, language, className }: BackToDashboardButtonProps) {
  const navigate = useNavigate();
  const variantClass = theme === 'dark' ? darkVariant : lightVariant;
  const label = pickLanguage(language, { en: 'Back to Dashboard', ro: 'Înapoi la panou' });

  return (
    <button
      type="button"
      className={`${baseClass} ${variantClass} ${className ?? ''}`.trim()}
      onClick={() => navigate('/')}
    >
      {label}
    </button>
  );
}

export default BackToDashboardButton;
