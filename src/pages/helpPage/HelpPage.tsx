import { useState } from 'react';
import './styles.scss';

// ── docs.config.json samples ──────────────────────────────────────────────────

const CONFIG_EMERALD = JSON.stringify(
  {
    navigation: [
      'LittlerootTown',
      'Route101',
      'OldaleTown',
      'Route103',
      'Route102',
      'PetalburgCity',
      'Route104',
      'PetalburgWoods',
      'RustboroCity',
      'Route116',
      'RusturfTunnel',
      'Route115',
      'Route105',
      'Route106',
      'DewfordTown',
      'GraniteCave',
      'Route107',
      'Route108',
      'AbandonedShip',
      'Route109',
      'SlateportCity',
      'Route110',
      'MauvilleCity',
      'Route117',
      'VerdanturfTown',
      'Route111',
      'Route112',
      'FieryPath',
      'Route113',
      'FallarborTown',
      'Route114',
      'MeteorFalls',
      'JaggedPass',
      'LavaridgeTown',
      'Route118',
      'Route119',
      'FortreeCity',
      'Route120',
      'Route121',
      'SafariZone',
      'LilycoveCity',
      'Route122',
      'MtPyre',
      'Route123',
      'MagmaHideout',
      'AquaHideout',
      'Route124',
      'MossdeepCity',
      'Route125',
      'ShoalCave',
      'Route126',
      'SootopolisCity',
      'CaveOfOrigin',
      'Route127',
      'Route128',
      'SeafloorCavern',
      'Route129',
      'Route130',
      'MirageIsland',
      'Route131',
      'SkyPillar',
      'PacifidlogTown',
      'Route132',
      'Route133',
      'Route134',
      'VictoryRoad',
      'EverGrandeCity',
      'ArtisanCave',
      'DesertUnderpass',
      'DesertRuins',
      'IslandCave',
      'AncientTomb',
      'MarineCave',
      'TerraCave',
      'SouthernIsland',
      'BirthIsland',
      'FarawayIsland',
      'NavelRock',
    ],
  },
  null,
  2,
);

const CONFIG_FRLG = JSON.stringify(
  {
    navigation: [
      'PalletTown',
      'Route1',
      'ViridianCity',
      'Route2',
      'ViridianForest',
      'PewterCity',
      'Route3',
      'MtMoon',
      'Route4',
      'CeruleanCity',
      'Route5',
      'Underground',
      'Route6',
      'VermilionCity',
      'Route7',
      'CeladonCity',
      'Route8',
      'Route9',
      'LavenderTown',
      'Route10',
      'Route11',
      'Route12',
      'Route13',
      'Route14',
      'Route15',
      'FuchsiaCity',
      'Route16',
      'Route17',
      'Route18',
      'Route19',
      'Route20',
      'SeafoamIslands',
      'Route21',
      'CinnabarIsland',
      'Route22',
      'Route23',
      'VictoryRoad',
      'IndigoPlateauExterior',
      'OneIsland',
      'TwoIsland',
      'ThreeIsland',
      'FourIsland',
      'FiveIsland',
      'SixIsland',
      'SevenIsland',
    ],
  },
  null,
  2,
);

const CONFIG_BLANK = JSON.stringify({ navigation: [] }, null, 2);

type ConfigTab = 'emerald' | 'frlg' | 'blank';

const TABS: { id: ConfigTab; label: string }[] = [
  { id: 'emerald', label: 'Emerald / Expansion' },
  { id: 'frlg', label: 'FireRed / LeafGreen' },
  { id: 'blank', label: 'Blank' },
];

const CONFIG_BY_TAB: Record<ConfigTab, string> = {
  emerald: CONFIG_EMERALD,
  frlg: CONFIG_FRLG,
  blank: CONFIG_BLANK,
};

// ── Simple syntax-highlighted JSON ────────────────────────────────────────────

function JsonBlock({ src }: { src: string }) {
  const [copied, setCopied] = useState(false);

  const copy = () => {
    navigator.clipboard.writeText(src).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 1800);
    });
  };

  // Colourize keys, strings, and punctuation
  const highlighted = src.replace(
    /("(?:[^"\\]|\\.)*")\s*(:)|("(?:[^"\\]|\\.)*")/g,
    (_, key, colon, str) => {
      if (key && colon)
        return `<span class="hjson-key">${key}</span><span class="hjson-punct">:</span>`;
      return `<span class="hjson-str">${str}</span>`;
    },
  );

  return (
    <div className="help-code-block">
      <button
        className={`help-copy-btn${copied ? ' help-copy-btn--copied' : ''}`}
        onClick={copy}
        aria-label="Copy to clipboard"
      >
        {copied ? '✓ Copied' : 'Copy'}
      </button>
      <pre dangerouslySetInnerHTML={{ __html: highlighted }} />
    </div>
  );
}

// ── Steps ──────────────────────────────────────────────────────────────────────

function Step({ n, children }: { n: number; children: React.ReactNode }) {
  return (
    <div className="help-step">
      <span className="help-step__num">{n}</span>
      <span className="help-step__text">{children}</span>
    </div>
  );
}

// ── Page ───────────────────────────────────────────────────────────────────────

export default function HelpPage() {
  const [activeTab, setActiveTab] = useState<ConfigTab>('emerald');

  return (
    <div className="help-page">
      <div className="help-content">
        {/* ── Header ── */}
        <div className="help-header">
          <h1 className="help-header__title">Help</h1>
          <p className="help-header__sub">Everything you need to get started with Decomp Docs.</p>
        </div>

        {/* ── What is this ── */}
        <section className="help-section">
          <h2 className="help-section__title">What is Decomp Docs?</h2>
          <p>
            Decomp Docs is a browser-based documentation tool for Pokémon ROM hack decompilation
            projects. Upload your project folder and it automatically parses your source files into
            a searchable, cross-linked reference for locations, Pokémon, items, moves, trainers,
            abilities, and types.
          </p>
          <p>Everything runs locally in your browser — no files are sent to a server.</p>
        </section>

        {/* ── Supported bases ── */}
        <section className="help-section">
          <h2 className="help-section__title">Supported bases</h2>
          <ul className="help-list">
            <li>
              <strong>pokeemerald-expansion</strong>
              <span className="help-tag">primary</span>
            </li>
            <li>pokeemerald</li>
            <li>pokefirered / pokeleafgreen</li>
            <li>pokeruby</li>
          </ul>
        </section>

        {/* ── Resources ── */}
        <section className="help-section">
          <h2 className="help-section__title">Resources</h2>
          <div className="help-links">
            <a
              className="help-link-card"
              href="https://github.com/rh-hideout/pokeemerald-expansion"
              target="_blank"
              rel="noopener noreferrer"
            >
              <span className="help-link-card__icon">
                {/* GitHub mark */}
                <svg viewBox="0 0 24 24" width={20} height={20} fill="currentColor">
                  <path d="M12 .5C5.65.5.5 5.65.5 12c0 5.09 3.29 9.4 7.86 10.93.57.1.78-.25.78-.55v-1.93c-3.19.69-3.86-1.54-3.86-1.54-.52-1.32-1.27-1.67-1.27-1.67-1.04-.71.08-.7.08-.7 1.15.08 1.76 1.18 1.76 1.18 1.02 1.75 2.68 1.24 3.33.95.1-.74.4-1.24.72-1.53-2.55-.29-5.23-1.27-5.23-5.67 0-1.25.45-2.28 1.18-3.08-.12-.29-.51-1.46.11-3.04 0 0 .96-.31 3.15 1.18a10.96 10.96 0 0 1 5.74 0c2.18-1.49 3.14-1.18 3.14-1.18.63 1.58.23 2.75.11 3.04.74.8 1.18 1.83 1.18 3.08 0 4.41-2.69 5.38-5.25 5.66.41.36.78 1.06.78 2.14v3.17c0 .3.2.66.79.55A11.51 11.51 0 0 0 23.5 12C23.5 5.65 18.35.5 12 .5z" />
                </svg>
              </span>
              <span className="help-link-card__body">
                <span className="help-link-card__name">pokeemerald-expansion</span>
                <span className="help-link-card__url">
                  github.com/rh-hideout/pokeemerald-expansion
                </span>
              </span>
              <span className="help-link-card__arrow">↗</span>
            </a>
          </div>
        </section>

        {/* ── Getting started ── */}
        <section className="help-section">
          <h2 className="help-section__title">Getting started</h2>
          <div className="help-steps">
            <Step n={1}>
              Clone or download your ROM hack's decompilation project to your local machine.
            </Step>
            <Step n={2}>
              Optionally add a <code>docs.config.json</code> file to your project's root folder to
              control the order locations appear in the sidebar (see below).
            </Step>
            <Step n={3}>
              Click the <strong>upload icon</strong> at the top of the left sidebar to return to the
              upload page.
            </Step>
            <Step n={4}>
              Click <strong>Choose folder</strong> and select your project's root folder.
            </Step>
            <Step n={5}>
              Click <strong>Parse</strong> and wait for the parse to complete.
            </Step>
          </div>
        </section>

        {/* ── docs.config.json ── */}
        <section className="help-section">
          <h2 className="help-section__title">
            <code>docs.config.json</code>
          </h2>
          <p>
            Place this file in the <strong>root of your project folder</strong>. It tells Decomp
            Docs the order locations should appear in the sidebar. The values must match the map
            group directory names in your project's <code>data/maps/</code> folder.
          </p>
          <p>
            If no config file is found, locations are listed in the order they are parsed from your
            source files.
          </p>

          <div className="help-config">
            <div className="help-tabs">
              {TABS.map((tab) => (
                <button
                  key={tab.id}
                  className={`help-tab${activeTab === tab.id ? ' help-tab--active' : ''}`}
                  onClick={() => setActiveTab(tab.id)}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            <JsonBlock src={CONFIG_BY_TAB[activeTab]} />
          </div>
        </section>
      </div>
    </div>
  );
}
