import { useMemo, useState } from 'react';
import { PageShell } from '../components/PageShell';
import { SiteHeader } from '../components/SiteHeader';
import { BackToDashboardButton } from '../components/BackToDashboardButton';
import type { UseGameStateResult } from '../hooks/useGameState';
import type { Theme } from '../hooks/useTheme';
import type { Language } from '../hooks/useLanguage';
import { pickLanguage } from '../i18n/utils';

type AlgorithmPageProps = {
  game: UseGameStateResult;
  theme: Theme;
  onToggleTheme: () => void;
  language: Language;
  onToggleLanguage: () => void;
};

type CarouselSlide = {
  id: string;
  badge: string;
  title: string;
  headline: string;
  description: string;
  notes: string[];
};

type PillarCard = {
  label: string;
  description: string;
  metric: string;
};

const copy = {
  en: {
    heroBadge: 'Inside the optimizer',
    heroTitle: 'How the algorithm works',
    heroIntro:
      'SkyKit optimizes rotable kit distribution across a hub-spoke airport network. The algorithm analyzes flight schedules, forecasts demand per kit class, makes purchasing decisions respecting lead times, and calculates optimal loading for each flight to minimize penalties.',
    heroFootnote: 'Use the carousel to explore each stage of the optimization pipeline.',
    prevLabel: 'Previous step',
    nextLabel: 'Next step',
    dotLabel: 'Go to slide',
    slideLabel: 'Step',
    pillarTitle: 'Operational constraint',
    pledgeTitle: 'Core principles',
    pledgeItems: [
      'Never exceed airport capacity limits — overflow penalty ($777/kit) is the most expensive.',
      'Respect lead times: only purchase kits that will arrive before the game ends.',
      'Prioritize hub-to-spoke distribution to prevent stock shortages at spoke airports.'
    ]
  },
  ro: {
    heroBadge: 'În interiorul optimizerului',
    heroTitle: 'Cum funcționează algoritmul',
    heroIntro:
      'SkyKit optimizează distribuția kiturilor rotabile într-o rețea de aeroporturi hub-spoke. Algoritmul analizează programul de zboruri, prognozează cererea per clasă de kit, ia decizii de achiziție respectând lead times, și calculează încărcarea optimă pentru fiecare zbor pentru a minimiza penalitățile.',
    heroFootnote: 'Folosește caruselul pentru a explora fiecare etapă a pipeline-ului de optimizare.',
    prevLabel: 'Pasul anterior',
    nextLabel: 'Pasul următor',
    dotLabel: 'Mergi la slide',
    slideLabel: 'Pasul',
    pillarTitle: 'Constrângere operațională',
    pledgeTitle: 'Principii de bază',
    pledgeItems: [
      'Nu depășim niciodată capacitatea aeroporturilor — penalitatea de overflow ($777/kit) este cea mai scumpă.',
      'Respectăm lead times: cumpărăm doar kituri care vor ajunge înainte de finalul jocului.',
      'Prioritizăm distribuția hub-spre-spoke pentru a preveni lipsa de stoc la aeroporturile spoke.'
    ]
  }
};

const carouselSlides = {
  en: [
    {
      id: 'calibrate',
      badge: 'Calibration',
      title: '1 · Analyze the dataset',
      headline: 'We parse CSV files and auto-calibrate parameters for this specific network.',
      description:
        'The calibrator analyzes airport capacities, flight routes, and distances to identify the hub-spoke topology. It calculates optimal thresholds and load factors tailored to the dataset.',
      notes: [
        'Network topology is detected automatically (hub vs spoke airports).',
        'Route economics (penalty/cost ratio) determine loading strategies.'
      ]
    },
    {
      id: 'forecast',
      badge: 'Demand forecasting',
      title: '2 · Forecast kit demand',
      headline: 'We estimate future demand at each airport using flight data.',
      description:
        'For known flights (received events), we calculate exact passenger counts. For future flights, we use the flight plan schedule. Demand is calculated separately for each kit class: First, Business, Premium Economy, and Economy.',
      notes: [
        'Inbound demand: kits arriving on incoming flights.',
        'Outbound demand: kits needed for departing passengers.'
      ]
    },
    {
      id: 'purchase',
      badge: 'Purchasing',
      title: '3 · Make purchasing decisions',
      headline: 'We buy kits when stock falls below class-specific thresholds.',
      description:
        'Each kit class has different thresholds (First: 10%, Business: 33%, Premium Economy: 40%, Economy: 70% of capacity) and lead times (48h, 36h, 24h, 12h respectively). Purchases are only made if kits will arrive before the game ends.',
      notes: [
        'Early-game: aggressive purchasing to build initial stock.',
        'End-game: final burst before lead time deadlines.'
      ]
    },
    {
      id: 'load',
      badge: 'Flight loading',
      title: '4 · Calculate optimal loading',
      headline: 'We determine how many kits to load on each departing flight.',
      description:
        'Load factor is calculated using an economic formula: ratio = penalty_avoided / total_cost. Higher ratios mean more aggressive loading. A destination safety factor reduces loading when the destination airport approaches capacity.',
      notes: [
        'HUB departures are prioritized to distribute kits to spokes.',
        'Flights are sorted by penalty exposure (passengers × distance × class factor).'
      ]
    },
    {
      id: 'adapt',
      badge: 'Adaptation',
      title: '5 · Adapt based on penalties',
      headline: 'We monitor penalties and adjust behavior over time.',
      description:
        'The adaptive engine tracks penalties over 72-hour windows. Per-airport risk scores are maintained based on overflow history. Load factors can be adjusted incrementally (±2% max per day) based on penalty patterns.',
      notes: [
        'High unfulfilled penalties with low overflow → increase load factor.',
        'Overflow penalties trigger capacity protection mode.'
      ]
    },
    {
      id: 'execute',
      badge: 'Execution',
      title: '6 · Execute and track',
      headline: 'We send purchase and load commands to the game server.',
      description:
        'The algorithm outputs two types of decisions: purchase orders (how many kits of each class to buy) and loading instructions (how many kits to load on each flight). All costs are tracked: acquisition, transport, and processing.',
      notes: [
        'In-flight kits are tracked until landing + processing time.',
        'Total penalty minimization is the primary objective.'
      ]
    }
  ] satisfies CarouselSlide[],
  ro: [
    {
      id: 'calibrate',
      badge: 'Calibrare',
      title: '1 · Analizăm datasetul',
      headline: 'Parsăm fișierele CSV și calibrăm automat parametrii pentru această rețea.',
      description:
        'Calibratorul analizează capacitățile aeroporturilor, rutele de zbor și distanțele pentru a identifica topologia hub-spoke. Calculează praguri și load factors optimizate pentru dataset.',
      notes: [
        'Topologia rețelei este detectată automat (aeroporturi hub vs spoke).',
        'Economia rutelor (raport penalitate/cost) determină strategiile de încărcare.'
      ]
    },
    {
      id: 'forecast',
      badge: 'Prognoză cerere',
      title: '2 · Prognozăm cererea de kituri',
      headline: 'Estimăm cererea viitoare la fiecare aeroport folosind datele de zbor.',
      description:
        'Pentru zborurile cunoscute (evenimente primite), calculăm exact numărul de pasageri. Pentru zborurile viitoare, folosim programul de zbor. Cererea se calculează separat pentru fiecare clasă: First, Business, Premium Economy și Economy.',
      notes: [
        'Cerere inbound: kituri care sosesc cu zborurile.',
        'Cerere outbound: kituri necesare pentru pasagerii care pleacă.'
      ]
    },
    {
      id: 'purchase',
      badge: 'Achiziții',
      title: '3 · Luăm decizii de achiziție',
      headline: 'Cumpărăm kituri când stocul scade sub praguri specifice per clasă.',
      description:
        'Fiecare clasă are praguri diferite (First: 10%, Business: 33%, Premium Economy: 40%, Economy: 70% din capacitate) și lead times (48h, 36h, 24h, 12h). Achizițiile se fac doar dacă kiturile vor ajunge înainte de finalul jocului.',
      notes: [
        'Early-game: achiziții agresive pentru stocul inițial.',
        'End-game: ultimul val înainte de deadline-urile lead time.'
      ]
    },
    {
      id: 'load',
      badge: 'Încărcare zboruri',
      title: '4 · Calculăm încărcarea optimă',
      headline: 'Determinăm câte kituri să încărcăm pe fiecare zbor.',
      description:
        'Load factor-ul se calculează cu o formulă economică: ratio = penalitate_evitată / cost_total. Raporturi mai mari înseamnă încărcare mai agresivă. Un factor de siguranță pentru destinație reduce încărcarea când aeroportul destinație se apropie de capacitate.',
      notes: [
        'Zborurile din HUB sunt prioritizate pentru a distribui kituri către spokes.',
        'Zborurile sunt sortate după expunerea la penalități (pasageri × distanță × factor clasă).'
      ]
    },
    {
      id: 'adapt',
      badge: 'Adaptare',
      title: '5 · Ne adaptăm pe baza penalităților',
      headline: 'Monitorizăm penalitățile și ajustăm comportamentul în timp.',
      description:
        'Motorul adaptiv urmărește penalitățile pe ferestre de 72 de ore. Scoruri de risc per aeroport sunt menținute pe baza istoricului de overflow. Load factors pot fi ajustate incremental (±2% max pe zi) pe baza pattern-urilor de penalități.',
      notes: [
        'Penalități unfulfilled ridicate cu overflow scăzut → creștem load factor.',
        'Penalitățile de overflow activează modul de protecție a capacității.'
      ]
    },
    {
      id: 'execute',
      badge: 'Execuție',
      title: '6 · Executăm și monitorizăm',
      headline: 'Trimitem comenzi de achiziție și încărcare către server.',
      description:
        'Algoritmul produce două tipuri de decizii: comenzi de achiziție (câte kituri din fiecare clasă să cumpărăm) și instrucțiuni de încărcare (câte kituri să încărcăm pe fiecare zbor). Toate costurile sunt monitorizate: achiziție, transport și procesare.',
      notes: [
        'Kiturile în zbor sunt urmărite până la aterizare + timp de procesare.',
        'Minimizarea penalităților totale este obiectivul principal.'
      ]
    }
  ] satisfies CarouselSlide[]
};

const pillarCards = {
  en: [
    {
      label: 'Capacity protection',
      description: 'Never exceed airport capacity limits. Overflow is the most expensive penalty at $777 per excess kit.',
      metric: '0 overflow tolerance'
    },
    {
      label: 'Lead time awareness',
      description: 'Purchases are only made if kits will arrive before the 30-day game ends, respecting class-specific lead times.',
      metric: '12h – 48h lead times'
    },
    {
      label: 'Hub-spoke balance',
      description: 'Prioritize distributing kits from hub to spoke airports while maintaining safety buffers at all locations.',
      metric: '1–3% safety buffer'
    }
  ] satisfies PillarCard[],
  ro: [
    {
      label: 'Protecția capacității',
      description: 'Nu depășim niciodată capacitatea aeroporturilor. Overflow-ul este cea mai scumpă penalitate: $777 per kit în exces.',
      metric: '0 toleranță overflow'
    },
    {
      label: 'Respectarea lead times',
      description: 'Achizițiile se fac doar dacă kiturile vor ajunge înainte de finalul jocului de 30 de zile, respectând lead times per clasă.',
      metric: '12h – 48h lead times'
    },
    {
      label: 'Echilibru hub-spoke',
      description: 'Prioritizăm distribuția kiturilor din hub către spoke menținând buffere de siguranță la toate locațiile.',
      metric: '1–3% buffer siguranță'
    }
  ] satisfies PillarCard[]
};

export function AlgorithmPage({ game, theme, onToggleTheme, language, onToggleLanguage }: AlgorithmPageProps) {
  const { isConnected } = game;
  const [activeSlide, setActiveSlide] = useState(0);
  const localizedCopy = useMemo(() => pickLanguage(language, copy), [language]);
  const slides = useMemo(() => pickLanguage(language, carouselSlides), [language]);
  const cards = useMemo(() => pickLanguage(language, pillarCards), [language]);

  const goTo = (index: number) => {
    if (slides.length === 0) return;
    const normalized = (index + slides.length) % slides.length;
    setActiveSlide(normalized);
  };

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

      <section className="rounded-[34px] border border-border/70 bg-linear-to-br from-bg-alt/80 via-panel/80 to-panel-dark/80 p-6 sm:p-10 shadow-[0_30px_80px_rgba(6,6,10,0.6)] space-y-6">
        <div className="flex flex-col gap-4">
          <span className="inline-flex items-center gap-2 rounded-full border border-border/60 px-4 py-1 text-[11px] uppercase tracking-[0.35em] text-text-muted">
            <span className="inline-block h-1 w-6 rounded-full bg-accent" />
            {localizedCopy.heroBadge}
          </span>
          <h2 className="text-3xl sm:text-4xl font-semibold">{localizedCopy.heroTitle}</h2>
          <p className="text-text-muted text-base max-w-3xl">{localizedCopy.heroIntro}</p>
          <p className="text-xs uppercase tracking-[0.3em] text-text-muted">{localizedCopy.heroFootnote}</p>
        </div>

        <div className="relative">
          <div className="relative overflow-hidden rounded-[30px] border border-border/80 bg-linear-to-br from-panel-dark/70 to-bg-alt/90 p-6 sm:p-10 min-h-[320px]">
            {slides.map((slide, index) => (
              <article
                key={slide.id}
                aria-hidden={index !== activeSlide}
                className={`transition-all duration-500 will-change-transform ${
                  index === activeSlide
                    ? 'opacity-100 translate-x-0'
                    : 'opacity-0 translate-x-6 pointer-events-none absolute inset-6'
                }`}
              >
                <span className="inline-flex items-center rounded-full bg-accent/10 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.35em] text-accent mb-4">
                  {slide.badge}
                </span>
                <p className="text-sm uppercase tracking-[0.3em] text-text-muted mb-1">
                  {localizedCopy.slideLabel} {index + 1}/{slides.length}
                </p>
                <h3 className="text-2xl sm:text-3xl font-semibold mb-3">{slide.title}</h3>
                <p className="text-lg text-accent-2 font-semibold mb-4">{slide.headline}</p>
                <p className="text-text-muted mb-5">{slide.description}</p>
                <ul className="space-y-2 text-sm text-text-muted">
                  {slide.notes.map(note => (
                    <li key={note} className="flex items-start gap-2">
                      <span className="mt-1 h-1.5 w-1.5 rounded-full bg-accent" aria-hidden />
                      <span>{note}</span>
                    </li>
                  ))}
                </ul>
              </article>
            ))}
          </div>

          <div className="flex flex-wrap items-center justify-between gap-4 mt-6">
            <div className="flex gap-3">
              <button
                type="button"
                onClick={() => goTo(activeSlide - 1)}
                className="rounded-full border border-border/70 bg-panel/60 px-4 py-2 text-xs font-semibold uppercase tracking-[0.3em] text-text hover:border-accent transition"
              >
                {localizedCopy.prevLabel}
              </button>
              <button
                type="button"
                onClick={() => goTo(activeSlide + 1)}
                className="rounded-full border border-border/70 bg-panel/60 px-4 py-2 text-xs font-semibold uppercase tracking-[0.3em] text-text hover:border-accent transition"
              >
                {localizedCopy.nextLabel}
              </button>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              {slides.map((slide, index) => (
                <button
                  key={slide.id}
                  type="button"
                  aria-label={`${localizedCopy.dotLabel} ${index + 1}`}
                  onClick={() => goTo(index)}
                  className={`h-3 w-3 rounded-full transition ${
                    index === activeSlide ? 'bg-accent shadow-[0_0_20px_rgba(56,189,248,0.6)]' : 'bg-border hover:bg-border/70'
                  }`}
                />
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="mt-10 grid gap-6 md:grid-cols-3">
        {cards.map(card => (
          <article
            key={card.label}
            className="glass-card rounded-[28px] border border-border/70 bg-linear-to-br from-panel-dark/70 to-panel/70 p-6"
          >
            <p className="text-xs uppercase tracking-[0.3em] text-text-muted mb-2">{localizedCopy.pillarTitle}</p>
            <h4 className="text-lg font-semibold mb-2">{card.label}</h4>
            <p className="text-text-muted text-sm mb-4">{card.description}</p>
            <p className="text-xs font-mono text-accent">{card.metric}</p>
          </article>
        ))}
      </section>

      <section className="mt-10 rounded-[34px] border border-border/60 bg-linear-to-r from-panel/70 to-bg-alt/70 p-6 sm:p-10">
        <p className="uppercase tracking-[0.4em] text-xs text-text-muted mb-3">{localizedCopy.pledgeTitle}</p>
        <ul className="space-y-4 text-sm text-text-muted">
          {localizedCopy.pledgeItems.map(item => (
            <li key={item} className="flex gap-3">
              <span className="mt-1 inline-flex h-2 w-2 rounded-full bg-accent" aria-hidden />
              <span>{item}</span>
            </li>
          ))}
        </ul>
      </section>
    </PageShell>
  );
}

export default AlgorithmPage;
