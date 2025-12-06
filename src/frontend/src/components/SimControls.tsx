interface SimControlsProps {
  isStarting: boolean;
  isRunning: boolean;
  isComplete: boolean;
  round: number;
  onStartGame: () => Promise<{ success: boolean; message: string }>;
}

export function SimControls({ isStarting, isRunning, isComplete, round, onStartGame }: SimControlsProps) {
  const statusText = isComplete
    ? 'Simulation Complete'
    : isRunning
    ? 'Simulation Running...'
    : isStarting
    ? 'Starting eval-platform...'
    : 'Ready to start';

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
    ? 'Starting...'
    : isRunning
    ? 'Running...'
    : isComplete
    ? 'Completed'
    : 'Start Simulation';

  return (
    <div className="border-t border-border/60 pt-6 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
      <div className="flex items-center gap-2">
        <div className={`w-2.5 h-2.5 rounded-full ${statusDotClass}`} />
        <span>{statusText}</span>
      </div>

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:gap-4">
        <p className="text-text-muted font-mono text-sm m-0">
          Round {round} / 720 ({((round / 720) * 100).toFixed(1)}% complete)
        </p>

        <button
          onClick={handleStart}
          disabled={isDisabled}
          className={`px-6 py-3 text-base font-semibold border border-transparent rounded-full transition-transform ${
            isDisabled
              ? 'bg-text-muted/30 text-text-muted cursor-not-allowed'
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
