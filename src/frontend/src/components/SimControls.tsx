import type { Language } from '../hooks/useLanguage';
import { pickLanguage } from '../i18n/utils';
import { TOTAL_ROUNDS } from '../constants/config';
import { formatPercent } from '../utils/formatting';

interface SimControlsProps {
  isStarting: boolean;
  isRunning: boolean;
  isComplete: boolean;
  round: number;
  onStartGame: () => Promise<{ success: boolean; message: string }>;
  language: Language;
}

export function SimControls({ isStarting, isRunning, isComplete, round, onStartGame, language }: SimControlsProps) {
  const statusText = isComplete
    ? pickLanguage(language, { en: 'Simulation complete', ro: 'Simulare finalizată' })
    : isRunning
    ? pickLanguage(language, { en: 'Simulation running...', ro: 'Simulare în desfășurare...' })
    : isStarting
    ? pickLanguage(language, { en: 'Starting evaluation platform...', ro: 'Pornim platforma de evaluare...' })
    : pickLanguage(language, { en: 'Ready to start', ro: 'Pregătit de start' });

  const handleStart = async () => {
    await onStartGame();
  };

  const isDisabled = isStarting || isRunning || isComplete;

  const statusDotClass = isComplete
    ? 'bg-accent'
    : isRunning
    ? 'bg-success animate-pulse-opacity'
    : isStarting
    ? 'bg-warning animate-pulse-opacity'
    : 'bg-text-muted';

  const buttonText = isStarting
    ? pickLanguage(language, { en: 'Starting...', ro: 'Se pornește...' })
    : isRunning
    ? pickLanguage(language, { en: 'Running...', ro: 'Rulează...' })
    : isComplete
    ? pickLanguage(language, { en: 'Completed', ro: 'Finalizat' })
    : pickLanguage(language, { en: 'Start simulation', ro: 'Pornește simularea' });

  const progress = round / TOTAL_ROUNDS;
  const progressText = pickLanguage(language, {
    en: `Round ${round} / ${TOTAL_ROUNDS} (${formatPercent(progress)} complete)`,
    ro: `Runda ${round} / ${TOTAL_ROUNDS} (${formatPercent(progress)} finalizat)`
  });

  return (
    <div className="border-t border-border/60 pt-6 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
      <div className="flex items-center gap-2">
        <div className={`w-2.5 h-2.5 rounded-full ${statusDotClass}`} />
        <span>{statusText}</span>
      </div>

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:gap-4">
        <p className="text-text-muted font-mono text-sm m-0">
          {progressText}
        </p>

        <button
          onClick={handleStart}
          disabled={isDisabled}
          aria-label={buttonText}
          aria-busy={isStarting || isRunning}
          className={`px-6 py-3 text-base font-semibold border border-transparent rounded-full transition-transform ${
            isDisabled
              ? 'bg-border/50 text-text-muted/80 cursor-not-allowed border-border/30'
              : 'bg-accent text-[#001121] cursor-pointer shadow-[0_10px_30px_rgba(46,180,255,0.35)] hover:-translate-y-0.5'
          }`}
        >
          {buttonText}
        </button>
      </div>
    </div>
  );
}

export default SimControls;
