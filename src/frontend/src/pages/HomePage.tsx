import { Link } from 'react-router-dom';
import { SimControls } from '../components/SimControls';
import { PageShell } from '../components/PageShell';
import { SiteHeader } from '../components/SiteHeader';
import type { UseGameStateResult } from '../hooks/useGameState';
import type { Theme } from '../hooks/useTheme';

type HomePageProps = {
  game: UseGameStateResult;
  theme: Theme;
  onToggleTheme: () => void;
};

const defaultGameState = {
  day: 0,
  hour: 0,
  round: 0,
  isStarting: false,
  isRunning: false,
  isComplete: false,
  stats: {
    totalCost: 0,
    transportCost: 0,
    processingCost: 0,
    purchaseCost: 0,
    penaltyCost: 0,
    totalPenalties: 0,
    roundsCompleted: 0
  },
  airports: [],
  activeFlights: [],
  events: [],
  recentPenalties: []
};

const navLinks = [
  { to: '/inventory', label: 'Airport Inventory' },
  { to: '/network', label: 'Global Network' },
  { to: '/events', label: 'Events & Penalties' }
];

const formatCost = (value: number): string => {
  if (value >= 1000000) {
    return `$${(value / 1000000).toFixed(2)}M`;
  }
  if (value >= 1000) {
    return `$${(value / 1000).toFixed(1)}K`;
  }
  return `$${value.toFixed(0)}`;
};

export function HomePage({ game, theme, onToggleTheme }: HomePageProps) {
  const { state, isLoading, error, isConnected, startGame } = game;

  if (isLoading) {
    return (
      <PageShell>
        <SiteHeader isConnected={isConnected} theme={theme} onToggleTheme={onToggleTheme} />
        <div className="flex flex-col items-center justify-center min-h-[200px] text-text-muted">
          <div className="w-10 h-10 border-[3px] border-border border-t-accent rounded-full animate-spin mb-4" />
          <p>Connecting to backend...</p>
        </div>
      </PageShell>
    );
  }

  if (error && !isConnected) {
    return (
      <PageShell>
        <SiteHeader isConnected={isConnected} theme={theme} onToggleTheme={onToggleTheme} />
        <section className="bg-gradient-to-br from-bg-alt/95 to-panel-dark/95 rounded-[34px] p-10 mb-10 shadow-[inset_0_0_0_1px_rgba(255,255,255,0.02),0_30px_80px_rgba(6,6,10,0.7)]">
          <div>
            <p className="uppercase tracking-[0.2em] text-xs text-text-muted mb-0.5">Connection Error</p>
            <h2 className="mt-1 mb-6 text-4xl">Cannot connect to backend</h2>
          </div>
          <p className="text-text-muted text-sm">
            Make sure the backend server is running on <code className="bg-panel px-2 py-1 rounded">http://localhost:3001</code>
          </p>
          <p className="text-text-muted text-sm mt-4">
            Run <code className="bg-panel px-2 py-1 rounded">npm run backend</code> to start the backend server.
          </p>
          <p className="text-danger text-sm mt-4">
            Error: {error}
          </p>
        </section>
      </PageShell>
    );
  }

  const gameState = state || defaultGameState;

  return (
    <PageShell>
      <SiteHeader isConnected={isConnected} theme={theme} onToggleTheme={onToggleTheme} />

      <nav className="flex flex-wrap gap-3 mb-6">
        {navLinks.map(link => (
          <Link
            key={link.to}
            to={link.to}
            className="rounded-full border border-border px-4 py-2 text-xs font-semibold uppercase tracking-[0.2em] text-text-muted transition hover:text-text hover:border-accent"
          >
            {link.label}
          </Link>
        ))}
      </nav>

      <section className="rounded-[30px] border border-border/70 bg-panel/70 p-6 sm:p-10 mb-10">
        <div className="mb-8 space-y-2">
          <p className="uppercase tracking-[0.2em] text-xs text-text-muted">Live Simulation</p>
          <h2 className="text-3xl sm:text-4xl">Day {gameState.day} · Hour {gameState.hour}</h2>
          <p className="text-text-muted text-sm max-w-2xl">
            A quick snapshot of the evaluation run. Visit the sections above to dive deeper into the inventory, global
            network, or event streams.
          </p>
        </div>

        <div className="grid gap-6 sm:grid-cols-2 mb-8">
          <div className="space-y-2">
            <p className="text-xs uppercase tracking-[0.3em] text-text-muted">Status</p>
            <div className="rounded-[18px] border border-border/60 p-4">
              <p className="m-0 font-mono text-sm text-text-muted">Round {gameState.stats.roundsCompleted} / 720</p>
              <p className="m-0 text-lg">{gameState.isComplete ? 'Complete' : gameState.isRunning ? 'In Progress' : 'Idle'}</p>
            </div>
          </div>
          <div className="space-y-2">
            <p className="text-xs uppercase tracking-[0.3em] text-text-muted">Connection</p>
            <div className="rounded-[18px] border border-border/60 p-4 flex items-center gap-2">
              <span className={`w-2 h-2 rounded-full ${isConnected ? 'bg-success' : 'bg-danger'}`} />
              <p className="m-0 text-sm">{isConnected ? 'Backend Connected' : 'Offline'}</p>
            </div>
          </div>
        </div>

        <div className="mb-8 space-y-3">
          <p className="text-xs uppercase tracking-[0.3em] text-text-muted">Key Metrics</p>
          <dl className="divide-y divide-border/60 border border-border/60 rounded-[18px]">
            {[{
              label: 'Total Cost',
              value: formatCost(gameState.stats.totalCost)
            }, {
              label: 'Transport Cost',
              value: formatCost(gameState.stats.transportCost)
            }, {
              label: 'Processing Cost',
              value: formatCost(gameState.stats.processingCost)
            }, {
              label: 'Penalties',
              value: `${gameState.stats.totalPenalties} • ${formatCost(gameState.stats.penaltyCost)}`
            }].map(({ label, value }) => (
              <div key={label} className="flex items-center justify-between gap-4 px-5 py-3 text-base">
                <dt className="text-text-muted">{label}</dt>
                <dd className="m-0 font-semibold">{value}</dd>
              </div>
            ))}
          </dl>
        </div>

        <SimControls
          isStarting={gameState.isStarting}
          isRunning={gameState.isRunning}
          isComplete={gameState.isComplete}
          round={gameState.stats.roundsCompleted}
          onStartGame={startGame}
        />
      </section>
    </PageShell>
  );
}

export default HomePage;
