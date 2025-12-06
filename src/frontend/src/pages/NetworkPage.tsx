import { MapPanel } from '../components/MapPanel';
import { PageShell } from '../components/PageShell';
import { SiteHeader } from '../components/SiteHeader';
import { BackToDashboardButton } from '../components/BackToDashboardButton';
import type { UseGameStateResult } from '../hooks/useGameState';
import type { Theme } from '../hooks/useTheme';
import type { Language } from '../hooks/useLanguage';
import { pickLanguage } from '../i18n/utils';

type NetworkPageProps = {
  game: UseGameStateResult;
  theme: Theme;
  onToggleTheme: () => void;
  language: Language;
  onToggleLanguage: () => void;
};

export function NetworkPage({ game, theme, onToggleTheme, language, onToggleLanguage }: NetworkPageProps) {
  const { state, isLoading, error, isConnected } = game;
  const flights = state?.activeFlights || [];
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
          <p className="uppercase tracking-[0.2em] text-xs text-text-muted mb-0.5">{t({ en: 'Global network', ro: 'Rețea globală' })}</p>
          <h2 className="mt-1 text-3xl">{t({ en: 'Active flight visualization', ro: 'Vizualizare zboruri active' })}</h2>
        </div>

        {isLoading && <p className="text-text-muted">{t({ en: 'Loading active flights...', ro: 'Încărcăm zborurile active...' })}</p>}
        {!isLoading && error && !isConnected && <p className="text-danger">{error}</p>}

        <MapPanel activeFlights={flights} language={language} />
      </section>
    </PageShell>
  );
}

export default NetworkPage;
