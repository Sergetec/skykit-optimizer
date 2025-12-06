import { InventoryPanel } from '../components/InventoryPanel';
import { PageShell } from '../components/PageShell';
import { SiteHeader } from '../components/SiteHeader';
import { BackToDashboardButton } from '../components/BackToDashboardButton';
import type { UseGameStateResult } from '../hooks/useGameState';
import type { Theme } from '../hooks/useTheme';
import type { Language } from '../hooks/useLanguage';
import { pickLanguage } from '../i18n/utils';

type InventoryPageProps = {
  game: UseGameStateResult;
  theme: Theme;
  onToggleTheme: () => void;
  language: Language;
  onToggleLanguage: () => void;
};

export function InventoryPage({ game, theme, onToggleTheme, language, onToggleLanguage }: InventoryPageProps) {
  const { state, isLoading, error, isConnected } = game;
  const airports = state?.airports || [];
  const t = <T,>(values: { en: T; ro: T }) => pickLanguage(language, values);

  return (
    <PageShell>
      <SiteHeader
        isConnected={isConnected}
        theme={theme}
        onToggleTheme={onToggleTheme}
        language={language}
        onToggleLanguage={onToggleLanguage}
      />

      <div className="mb-6">
        <BackToDashboardButton theme={theme} language={language} />
      </div>

      <section className="bg-gradient-to-br from-bg-alt/95 to-panel-dark/95 rounded-[34px] p-6 sm:p-10 shadow-[inset_0_0_0_1px_rgba(255,255,255,0.02),0_30px_80px_rgba(6,6,10,0.7)]">
        <div className="mb-6">
          <p className="uppercase tracking-[0.2em] text-xs text-text-muted mb-0.5">{t({ en: 'Airport inventory overview', ro: 'Prezentare inventar aeroporturi' })}</p>
          <h2 className="mt-1 text-3xl">{t({ en: 'All stocked locations', ro: 'Toate locațiile cu stoc' })}</h2>
        </div>

        {isLoading && (
          <div className="text-text-muted text-sm">{t({ en: 'Loading inventory...', ro: 'Încărcăm inventarul...' })}</div>
        )}

        {!isLoading && error && !isConnected && (
          <p className="text-danger">{error}</p>
        )}

        {!isLoading && (!airports || airports.length === 0) && (
          <p className="text-text-muted">{t({ en: 'No airports available.', ro: 'Nu sunt aeroporturi disponibile.' })}</p>
        )}

        {airports.length > 0 && (
          <InventoryPanel airports={airports} language={language} />
        )}
      </section>
    </PageShell>
  );
}

export default InventoryPage;
