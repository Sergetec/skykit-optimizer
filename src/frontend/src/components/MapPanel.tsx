import type { FlightInfo } from '../hooks/useGameState';
import type { Language } from '../hooks/useLanguage';
import { pickLanguage } from '../i18n/utils';

interface MapPanelProps {
  activeFlights: FlightInfo[];
  language: Language;
}

export function MapPanel({ activeFlights, language }: MapPanelProps) {
  const scheduledCount = activeFlights.filter(f => f.status === 'SCHEDULED').length;
  const checkedInCount = activeFlights.filter(f => f.status === 'CHECKED_IN').length;
  const badge = pickLanguage(language, { en: 'Global Network', ro: 'Rețea globală' });
  const subtext = pickLanguage(language, {
    en: 'Real-time kit allocation across 161 airports.',
    ro: 'Distribuție în timp real a kiturilor pe 161 de aeroporturi.'
  });
  const scheduledLabel = pickLanguage(language, { en: 'scheduled flights', ro: 'zboruri programate' });
  const checkedInLabel = pickLanguage(language, { en: 'checked-in flights', ro: 'zboruri înregistrate' });
  const totalLabel = pickLanguage(language, { en: 'total active', ro: 'zboruri active' });

  return (
    <div className="relative rounded-[20px] border border-border min-h-[360px] overflow-hidden flex items-center justify-center bg-[radial-gradient(circle_at_30%_30%,rgba(46,180,255,0.5),transparent_55%),radial-gradient(circle_at_60%_60%,rgba(46,255,180,0.4),transparent_50%),#60a5fa]">
      <div className="absolute inset-6 rounded-[20px] p-6 bg-gradient-to-br from-blue-400/40 to-blue-500/25 border border-white/10 z-10">
        <p className="uppercase tracking-[0.2em] text-xs text-text-muted mb-0.5">{badge}</p>
        <p className="text-text-muted text-sm">{subtext}</p>
        <div className="mt-8 space-y-2">
          <p className="my-2">
            <span className="text-success">{scheduledCount}</span> {scheduledLabel}
          </p>
          <p className="my-2">
            <span className="text-success">{checkedInCount}</span> {checkedInLabel}
          </p>
          <p className="my-2">
            <strong>{activeFlights.length}</strong> {totalLabel}
          </p>
        </div>
      </div>
    </div>
  );
}

export default MapPanel;
