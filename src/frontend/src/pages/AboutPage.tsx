import { PageShell } from '../components/PageShell';
import { SiteHeader } from '../components/SiteHeader';
import { BackToDashboardButton } from '../components/BackToDashboardButton';
import type { UseGameStateResult } from '../hooks/useGameState';
import type { Theme } from '../hooks/useTheme';
import type { Language } from '../hooks/useLanguage';

type AboutPageProps = {
  game: UseGameStateResult;
  theme: Theme;
  onToggleTheme: () => void;
  language: Language;
  onToggleLanguage: () => void;
};

const aboutContent = {
  en: {
    heroBadge: 'About Our Crew',
    heroTitle: 'About our crew',
    heroIntro:
      'This console is powered by Antonia Duțu, Mihnea-Rafael Dunărințu, and Sergiu Lefter—three Computer Engineering (IoT) students whose CVs span Verasys production work, Olympiad prizes, DiscoverEU travel, and a stack of React, Payload CMS, MongoDB, and Gemini-based projects.',
    focusLabel: 'What our CVs bring',
    focusAreas: [
      {
        label: 'IoT-born engineering',
        body: 'All three of us study Computer Engineering (IoT) at UNSTPB/FILS, so telemetry and connected devices anchor every decision we make inside SkyKit.'
      },
      {
        label: 'Production-first delivery',
        body: 'Mihnea and Sergiu both shipped Verasys commerce systems (Payload CMS, Next.js, REST APIs) and bring that full-stack discipline directly into our hackathon code.'
      },
      {
        label: 'Competitive grit',
        body: 'Antonia’s Special Prize at the National Informatics Olympiad plus years of Scientific Communication Sessions keep our algorithms sharp and review-ready.'
      }
    ],
    mottoLabel: 'What drives us',
    mottoValue: 'Ship hackathon ideas with production-grade polish',
    snapshotLabel: 'Team snapshot',
    snapshotItems: [
      { label: 'Production systems', value: 'Verasys commerce stack · Inventory Manager RBAC suite' },
      { label: 'Competitions', value: 'Perpetuum Hackathon · Students’ Scientific Communication Session · Informatics Olympiad' },
      { label: 'Community', value: 'DiscoverEU fellow · Brainly QA moderator · Bucharest Science Festival exhibitor' }
    ],
    snapshotNote: 'CV-backed experience means every animation and number inside SkyKit is accountable to real-world deliveries.',
    teamLabel: 'Meet the team',
    stackLabel: 'Stack',
    teamMembers: [
      {
        name: 'Antonia Duțu',
        title: 'Product Engineer · IoT & Algorithms',
        education: 'Computer Engineering (IoT) · UNSTPB — Tudor Vianu HS alumna',
        summary:
          'Pairs Olympiad-level C++/Java foundations with React and TypeScript interfaces; led Cutie Habit, AnaBot (Gemini API), and multiple scientific-session demos.',
        highlights: [
          'Special Prize – National Informatics Olympiad (regional) · automatic university admission',
          'Students’ Scientific Communication Session 2025 – two accepted projects (data structures + UI)',
          'Perpetuum Hackathon, EDB StartUP finalist, and IC3 + FCE certified'
        ],
        stack: 'C++, Java, React, SQL, Bash'
      },
      {
        name: 'Mihnea-Rafael Dunărințu',
        title: 'Fullstack Engineer · Payload & Firebase',
        education: 'Computer Engineering (IoT) · UNSTPB — Constantin Brâncoveanu Tech College',
        summary:
          'Currently a Fullstack Engineer at Verasys, operating Payload CMS/Next.js e-commerce backends with AI semantic search, Dockerized ops, and data ingestion pipelines.',
        highlights: [
          'Built EDUFILS educational portal and a Bash-powered realtime form site with MariaDB + websockets',
          'Students’ Scientific Communication Session 2025 – Task Manager fullstack submission',
          'Multiple podium finishes at National Informatics Olympiad county stages (2nd & 3rd place)'
        ],
        stack: 'TypeScript, React, Payload CMS, SQL, Firebase, Bash'
      },
      {
        name: 'Sergiu Lefter',
        title: 'Platform & Integrations Engineer',
        education: 'Computer Engineering · UNSTPB — DiscoverEU Erasmus cohort',
        summary:
          'Full Stack Web Developer at Verasys (Next.js, Tailwind, Payload CMS) with a focus on ingesting provider feeds, QA moderation, and interactive science outreach.',
        highlights: [
          'Inventory Manager project with RBAC dashboards (Node.js, React, MongoDB, Chart.js)',
          'Brainly Romania QA moderator plus Bucharest Science Festival exhibitor',
          'Merit award at Bucharest Informatics Olympiad · DiscoverEU cultural ambassador'
        ],
        stack: 'Next.js, TypeScript, MongoDB, Tailwind CSS, REST APIs'
      }
    ],
    timelineLabel: 'Hackathon timeline',
    timeline: [
      {
        phase: 'Olympiad roots · 2021-2023',
        detail: 'Antonia and Mihnea collect National Informatics Olympiad distinctions while Sergiu moderates Brainly and showcases STEM demos across Bucharest.'
      },
      {
        phase: 'Engineering track · 2024',
        detail: 'All three enroll in Computer Engineering (IoT) at UNSTPB/FILS, bringing DiscoverEU travel insights and math-info rigor to team projects.'
      },
      {
        phase: 'Production internships · 2025',
        detail: 'Mihnea joins Verasys to ship Payload CMS services, Sergiu runs Verasys integrations + Inventory Manager, and Antonia presents dual projects at the Scientific Communication Session.'
      },
      {
        phase: 'SkyKit build · Present',
        detail: 'We merge those CV-proven chops into the SkyKit Optimizer—mixing TypeScript pipelines, IoT telemetry, and competition-tested UX craft.'
      }
    ],
    phaseLabel: 'Phase',
    contactPrefix: 'Want to collaborate or see the optimizer paired with your dataset? Reach us via',
    contactSuffix: '.'
  },
  ro: {
    heroBadge: 'Despre echipă',
    heroTitle: 'Despre echipa noastră',
    heroIntro:
      'Această consolă este construită de Antonia Duțu, Mihnea-Rafael Dunărințu și Sergiu Lefter — studenți la Inginerie în Calculatoare (IoT) cu CV-uri care includ proiecte de producție Verasys, premii la olimpiade, experiențe DiscoverEU și proiecte în React, Payload CMS, MongoDB și Gemini.',
    focusLabel: 'Ce aduc CV-urile noastre',
    focusAreas: [
      {
        label: 'Inginerie născută în IoT',
        body: 'Toți trei studiem Inginerie în Calculatoare (IoT) la UNSTPB/FILS, iar telemetria și dispozitivele conectate ghidează fiecare decizie pe care o luăm în SkyKit.'
      },
      {
        label: 'Livrare cu reflexe de producție',
        body: 'Mihnea și Sergiu au livrat sisteme comerciale Verasys (Payload CMS, Next.js, REST APIs) și aduc aceeași disciplină full-stack direct în codul de hackathon.'
      },
      {
        label: 'Instinct competitiv',
        body: 'Premiul special obținut de Antonia la Olimpiada Națională de Informatică și anii de Sesiuni de Comunicări Științifice țin algoritmii noștri ascuțiți și gata de review.'
      }
    ],
    mottoLabel: 'Ce ne motivează',
    mottoValue: 'Livrăm idei de hackathon cu finisaj demn de producție',
    snapshotLabel: 'Instantaneu al echipei',
    snapshotItems: [
      { label: 'Sisteme de producție', value: 'Stack comercial Verasys · Suită Inventory Manager cu RBAC' },
      { label: 'Competiții', value: 'Perpetuum Hackathon · Sesiunea de Comunicări Științifice · Olimpiada de Informatică' },
      { label: 'Comunitate', value: 'Bursier DiscoverEU · Moderator Brainly QA · Expozant la Bucharest Science Festival' }
    ],
    snapshotNote: 'Experiența confirmată în CV înseamnă că fiecare animație și fiecare număr din SkyKit are acoperire prin livrări reale.',
    teamLabel: 'Cunoaște echipa',
    stackLabel: 'Stack tehnologic',
    teamMembers: [
      {
        name: 'Antonia Duțu',
        title: 'Inginer de produs · IoT & Algoritmi',
        education: 'Inginerie în Calculatoare (IoT) · UNSTPB — absolventă Tudor Vianu',
        summary:
          'Îmbină fundații C++/Java la nivel de olimpiadă cu interfețe React și TypeScript; a condus Cutie Habit, AnaBot (Gemini API) și multiple demo-uri pentru sesiuni științifice.',
        highlights: [
          'Premiu special – Olimpiada Națională de Informatică (etapa regională) · admitere automată la facultate',
          'Sesiunea de Comunicări Științifice 2025 – două proiecte acceptate (structuri de date + UI)',
          'Perpetuum Hackathon, finalistă EDB StartUP și certificări IC3 + FCE'
        ],
        stack: 'C++, Java, React, SQL, Bash'
      },
      {
        name: 'Mihnea-Rafael Dunărințu',
        title: 'Inginer fullstack · Payload & Firebase',
        education: 'Inginerie în Calculatoare (IoT) · UNSTPB — Colegiul Tehnic Constantin Brâncoveanu',
        summary:
          'Inginer fullstack la Verasys, administrează backend-uri Payload CMS/Next.js cu căutare semantică AI, operațiuni Docker și fluxuri de ingestie a datelor.',
        highlights: [
          'A construit portalul educațional EDUFILS și un site de formulare realtime în Bash cu MariaDB + websockets',
          'Sesiunea de Comunicări Științifice 2025 – aplicație Task Manager fullstack',
          'Mai multe podiumuri la etapele județene ale Olimpiadei Naționale de Informatică (locurile 2 și 3)'
        ],
        stack: 'TypeScript, React, Payload CMS, SQL, Firebase, Bash'
      },
      {
        name: 'Sergiu Lefter',
        title: 'Inginer platforme & integrări',
        education: 'Inginerie în Calculatoare · UNSTPB — cohorta DiscoverEU Erasmus',
        summary:
          'Full Stack Web Developer la Verasys (Next.js, Tailwind, Payload CMS) axat pe ingestia fluxurilor de la furnizori, moderare QA și outreach științific interactiv.',
        highlights: [
          'Proiect Inventory Manager cu dashboard-uri RBAC (Node.js, React, MongoDB, Chart.js)',
          'Moderator Brainly România + expozant la Bucharest Science Festival',
          'Premiu de merit la Olimpiada de Informatică București · ambasador DiscoverEU'
        ],
        stack: 'Next.js, TypeScript, MongoDB, Tailwind CSS, REST APIs'
      }
    ],
    timelineLabel: 'Cronologia hackathonului',
    timeline: [
      {
        phase: 'Rădăcini olimpice · 2021-2023',
        detail: 'Antonia și Mihnea adună distincții la Olimpiada Națională de Informatică, iar Sergiu moderează Brainly și prezintă demonstrații STEM prin București.'
      },
      {
        phase: 'Traseu de inginerie · 2024',
        detail: 'Toți trei intră la Inginerie în Calculatoare (IoT) la UNSTPB/FILS și aduc în proiecte insight-uri DiscoverEU și rigoare mate-info.'
      },
      {
        phase: 'Internship-uri de producție · 2025',
        detail: 'Mihnea se alătură Verasys pentru servicii Payload CMS, Sergiu gestionează integrări + Inventory Manager, iar Antonia prezintă două proiecte la Sesiunea de Comunicări Științifice.'
      },
      {
        phase: 'SkyKit build · Prezent',
        detail: 'Îmbinăm aceste experiențe validate în CV în SkyKit Optimizer — mixând pipeline-uri TypeScript, telemetrie IoT și UX testat în competiții.'
      }
    ],
    phaseLabel: 'Faza',
    contactPrefix: 'Vrei să colaborăm sau să vezi optimizerul pe datele tale? Scrie-ne la',
    contactSuffix: '.'
  }
} as const;

export function AboutPage({ game, theme, onToggleTheme, language, onToggleLanguage }: AboutPageProps) {
  const { isConnected } = game;
  const content = aboutContent[language];

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

      <section className="relative overflow-hidden rounded-[34px] border border-border/60 bg-gradient-to-br from-bg-alt/70 via-panel/80 to-panel-dark/80 p-6 sm:p-10 space-y-10">
        <div className="pointer-events-none absolute inset-0 opacity-20 grid-overlay" />
        <div className="relative z-10 space-y-10">
          <header>
            <p className="uppercase tracking-[0.4em] text-[11px] text-text-muted flex items-center gap-2">
              <span className="inline-flex h-1 w-10 rounded-full bg-accent" /> {content.heroBadge}
            </p>
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-semibold leading-tight">
              {content.heroTitle}
            </h2>
            <p className="text-text-muted text-base max-w-3xl mt-3">
              {content.heroIntro}
            </p>
          </header>

          <div className="grid gap-6 lg:grid-cols-[1.2fr_0.8fr]">
            <div className="glass-card rounded-[28px] p-6 border border-border/70 space-y-6">
              <p className="text-xs uppercase tracking-[0.3em] text-text-muted">{content.focusLabel}</p>
              <div className="grid gap-4 sm:grid-cols-2">
                {content.focusAreas.map(area => (
                  <article key={area.label} className="rounded-[22px] border border-border/60 p-5">
                    <h3 className="m-0 text-sm uppercase tracking-[0.2em] text-text-muted">{area.label}</h3>
                    <p className="m-0 mt-2 text-base">{area.body}</p>
                  </article>
                ))}
              </div>
              <div className="rounded-[24px] border border-border/60 p-6">
                <p className="m-0 text-xs uppercase tracking-[0.3em] text-text-muted">{content.mottoLabel}</p>
                <p className="text-2xl font-semibold mt-2">{content.mottoValue}</p>
              </div>
            </div>

            <div className="glass-card rounded-[28px] p-6 border border-border/70 space-y-4">
              <p className="text-xs uppercase tracking-[0.3em] text-text-muted">{content.snapshotLabel}</p>
              <div className="space-y-3">
                {content.snapshotItems.map(item => (
                  <div key={item.label} className="rounded-[20px] border border-border/60 p-4">
                    <p className="m-0 text-text-muted text-xs uppercase tracking-[0.3em]">{item.label}</p>
                    <p className="m-0 mt-1 text-base">{item.value}</p>
                  </div>
                ))}
              </div>
              <p className="text-text-muted text-sm">
                {content.snapshotNote}
              </p>
            </div>
          </div>

          <div className="glass-card rounded-[28px] p-6 border border-border/70">
            <p className="text-xs uppercase tracking-[0.3em] text-text-muted mb-6">{content.teamLabel}</p>
            <div className="grid gap-4 md:grid-cols-3">
              {content.teamMembers.map(member => (
                <div key={member.name} className="rounded-[24px] border border-border/50 p-5 space-y-3">
                  <div>
                    <p className="text-lg font-semibold m-0">{member.name}</p>
                    <p className="text-text-muted text-sm m-0">{member.title}</p>
                  </div>
                  <p className="text-text-muted text-sm m-0">{member.education}</p>
                  <p className="m-0 text-base">{member.summary}</p>
                  <ul className="m-0 pl-5 text-sm text-text-muted space-y-1 list-disc">
                    {member.highlights.map(highlight => (
                      <li key={highlight}>{highlight}</li>
                    ))}
                  </ul>
                  <p className="m-0 text-xs uppercase tracking-[0.3em] text-text-muted">{content.stackLabel} · <span className="text-text">{member.stack}</span></p>
                </div>
              ))}
            </div>
          </div>

          <div className="glass-card rounded-[28px] p-6 border border-border/70">
            <p className="text-xs uppercase tracking-[0.3em] text-text-muted mb-6">{content.timelineLabel}</p>
            <ol className="list-none m-0 space-y-5">
              {content.timeline.map((entry, index) => (
                <li key={entry.phase} className="relative pl-8">
                  <span className="absolute left-0 top-1.5 h-1.5 w-1.5 rounded-full bg-accent animate-pulse-opacity" />
                  <p className="m-0 text-sm uppercase tracking-[0.25em] text-text-muted">{content.phaseLabel} {index + 1}</p>
                  <h4 className="m-0 text-xl">{entry.phase}</h4>
                  <p className="m-0 text-base text-text-muted">{entry.detail}</p>
                </li>
              ))}
            </ol>
          </div>

          <footer className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <p className="text-text-muted text-sm">
              {content.contactPrefix}{' '}
              <a href="mailto:skykit@hackathon.team" className="text-accent underline-offset-4 hover:underline">skykit@hackathon.team</a>{content.contactSuffix}
            </p>
          </footer>
        </div>
      </section>
    </PageShell>
  );
}

export default AboutPage;
