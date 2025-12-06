import { memo, useMemo, useState, useCallback } from 'react';
import type { GameEvent, PenaltyInfo, PenaltiesByDay } from '../hooks/useGameState';
import type { Language } from '../hooks/useLanguage';
import { pickLanguage } from '../i18n/utils';
import { MAX_EVENTS_HEIGHT } from '../constants/config';

interface EventsPanelProps {
  events: GameEvent[];
  penalties: PenaltyInfo[];
  penaltiesByDay?: PenaltiesByDay;
  language: Language;
}

type TabType = 'events' | 'penalties';

const badgeStyles = {
  base: 'w-8 h-8 rounded-full grid place-items-center text-sm shrink-0',
  flight: 'bg-accent/15 text-accent',
  purchase: 'bg-accent/15 text-accent',
  warning: 'bg-amber-500/15 text-amber-400',
  penalty: 'bg-danger/15 text-danger',
  danger: 'bg-danger/15 text-danger'
};

const eventIcons: Record<string, string> = {
  flight: '✈',
  purchase: '⬆',
  warning: '⚠',
  penalty: '$'
};

function EventsPanelInner({ events, penalties, penaltiesByDay, language }: EventsPanelProps) {
  const [activeTab, setActiveTab] = useState<TabType>('events');
  const locale = useMemo(() => (language === 'ro' ? 'ro-RO' : 'en-US'), [language]);
  const eventsLabel = pickLanguage(language, { en: 'Events', ro: 'Evenimente' });
  const penaltiesLabel = pickLanguage(language, { en: 'Penalties', ro: 'Penalizări' });
  const noEventsText = pickLanguage(language, { en: 'No events yet. Start the game to see updates.', ro: 'Încă nu există evenimente. Pornește jocul pentru a vedea actualizări.' });
  const noPenaltiesText = pickLanguage(language, { en: 'No penalties incurred yet.', ro: 'Nu s-au aplicat penalizări.' });
  const dayLabel = (day: number) => pickLanguage(language, { en: `Day ${day}`, ro: `Ziua ${day}` });
  const penaltyCountLabel = (count: number) => pickLanguage(language, { en: `${count} penalties`, ro: `${count} penalizări` });
  const flightLabel = pickLanguage(language, { en: 'Flight', ro: 'Zbor' });

  // Memoized tab handlers to prevent unnecessary re-renders
  const handleEventsTab = useCallback(() => setActiveTab('events'), []);
  const handlePenaltiesTab = useCallback(() => setActiveTab('penalties'), []);

  // Memoize total penalties count
  const totalPenaltiesCount = useMemo(() =>
    penaltiesByDay
      ? Object.values(penaltiesByDay).reduce((sum, arr) => sum + arr.length, 0)
      : penalties.length,
    [penaltiesByDay, penalties.length]
  );

  // Memoize sorted days (descending - newest first)
  const sortedDays = useMemo(() =>
    penaltiesByDay
      ? Object.keys(penaltiesByDay).map(Number).sort((a, b) => b - a)
      : [],
    [penaltiesByDay]
  );

  // Memoize reversed events to prevent re-computation
  const reversedEvents = useMemo(() => events.slice().reverse(), [events]);

  // Calculate day totals
  const getDayTotal = (day: number): number => {
    if (!penaltiesByDay || !penaltiesByDay[day]) return 0;
    return penaltiesByDay[day].reduce((sum, p) => sum + p.amount, 0);
  };

  return (
    <div className="bg-panel rounded-[20px] border border-border flex flex-col overflow-hidden" role="region" aria-label={activeTab === 'events' ? eventsLabel : penaltiesLabel}>
      <div className="flex border-b border-white/10" role="tablist">
        <button
          role="tab"
          aria-selected={activeTab === 'events'}
          aria-controls="events-tabpanel"
          className={`flex-1 bg-transparent border-none text-text-muted font-semibold p-4 cursor-pointer transition-colors ${activeTab === 'events' ? 'bg-white/5 text-text' : ''}`}
          onClick={handleEventsTab}
        >
          {eventsLabel} ({events.length})
        </button>
        <button
          role="tab"
          aria-selected={activeTab === 'penalties'}
          aria-controls="penalties-tabpanel"
          className={`flex-1 bg-transparent border-none text-text-muted font-semibold p-4 cursor-pointer transition-colors ${activeTab === 'penalties' ? 'bg-white/5 text-text' : ''}`}
          onClick={handlePenaltiesTab}
        >
          {penaltiesLabel} ({totalPenaltiesCount})
        </button>
      </div>
      <div
        className="overflow-y-auto px-5 pb-5 pt-0"
        style={{ maxHeight: `${MAX_EVENTS_HEIGHT}px` }}
        role="tabpanel"
        id={activeTab === 'events' ? 'events-tabpanel' : 'penalties-tabpanel'}
        aria-live="polite"
      >
        {activeTab === 'events' ? (
          <div className="pt-5" role="list">
            {events.length === 0 ? (
              <p className="text-text-muted text-sm">{noEventsText}</p>
            ) : (
              reversedEvents.map((event, index) => {
                const iconType = event.type as keyof typeof badgeStyles;
                const badgeClass = badgeStyles[iconType] || badgeStyles.flight;
                // Create unique key from event properties
                const eventKey = `${event.type}-${event.timestamp}-${index}`;
                return (
                  <div key={eventKey} className="flex items-start gap-3 py-3 border-b border-white/5 last:border-b-0" role="listitem">
                    <span className={`${badgeStyles.base} ${badgeClass}`} aria-hidden="true">
                      {eventIcons[event.type] || '✈'}
                    </span>
                    <p className="m-0 text-sm">{event.text}</p>
                  </div>
                );
              })
            )}
          </div>
        ) : penaltiesByDay && sortedDays.length > 0 ? (
          // Show penalties grouped by day
          sortedDays.map(day => {
            const dayPenalties = penaltiesByDay[day] || [];
            const dayTotal = getDayTotal(day);
            return (
              <div key={day} className="mb-6 last:mb-0">
                {/* Day header */}
                <div className="sticky top-0 bg-panel py-2 border-b border-accent/30 mb-3">
                  <div className="flex justify-between items-center">
                    <h3 className="text-lg font-semibold text-accent m-0">{dayLabel(day)}</h3>
                    <div className="text-right">
                      <span className="text-text-muted text-xs">{penaltyCountLabel(dayPenalties.length)}</span>
                      <span className="text-danger font-bold ml-3">${dayTotal.toLocaleString(locale, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                    </div>
                  </div>
                </div>
                {/* Penalties for this day */}
                {dayPenalties.map((penalty, index) => {
                  // Create unique key from penalty properties
                  const penaltyKey = `${day}-${penalty.code}-${penalty.issuedHour}-${index}`;
                  return (
                  <div key={penaltyKey} className="flex items-start gap-3 py-2 border-b border-white/5 last:border-b-0 ml-2" role="listitem">
                    <span className={`${badgeStyles.base} ${badgeStyles.danger}`} aria-hidden="true">$</span>
                    <div className="flex-1">
                      <p className="m-0 text-sm">
                        <strong className="text-danger">${penalty.amount.toLocaleString(locale, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</strong>
                        {' - '}{penalty.code}
                      </p>
                      <p className="text-text-muted text-xs mt-1 m-0">
                        <span className="text-accent/70">{pickLanguage(language, { en: `H${penalty.issuedHour}`, ro: `Ora ${penalty.issuedHour}` })}</span>
                        {' '}{penalty.reason}
                        {penalty.flightNumber && <span className="ml-2 text-accent">{flightLabel}: {penalty.flightNumber}</span>}
                      </p>
                    </div>
                  </div>
                  );
                })}
              </div>
            );
          })
        ) : penalties.length === 0 ? (
          <div className="pt-5">
            <p className="text-text-muted text-sm">{noPenaltiesText}</p>
          </div>
        ) : (
          // Fallback to simple list if penaltiesByDay not available
          <div className="pt-5" role="list">
            {penalties.slice().reverse().map((penalty, index) => {
              const penaltyKey = `fallback-${penalty.code}-${penalty.issuedDay}-${penalty.issuedHour}-${index}`;
              return (
              <div key={penaltyKey} className="flex items-start gap-3 py-3 border-b border-white/5 last:border-b-0" role="listitem">
                <span className={`${badgeStyles.base} ${badgeStyles.danger}`} aria-hidden="true">$</span>
                <div>
                  <p className="m-0 text-sm">
                    <strong className="text-danger">${penalty.amount.toLocaleString(locale, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</strong>
                    {' - '}{penalty.code}
                  </p>
                  <p className="text-text-muted text-xs mt-1 m-0">
                    {penalty.reason}
                  </p>
                </div>
              </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

// Wrap with React.memo to prevent unnecessary re-renders
export const EventsPanel = memo(EventsPanelInner);

export default EventsPanel;
