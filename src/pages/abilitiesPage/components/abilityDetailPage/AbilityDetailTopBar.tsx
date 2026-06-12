import './styles.scss';

const ABILITY_SECTIONS = [
  { id: 'ability-overview', label: 'Overview' },
  { id: 'ability-pokemon', label: 'Pokémon' },
  { id: 'ability-trainers', label: 'Trainers' },
] as const;

export type AbilitySectionId = (typeof ABILITY_SECTIONS)[number]['id'];

export { ABILITY_SECTIONS };

type Props = {
  abilityName: string;
  activeSection: AbilitySectionId;
  onScrollTo: (id: AbilitySectionId) => void;
  onScrollToTop: () => void;
};

export default function AbilityDetailTopBar({
  abilityName,
  activeSection,
  onScrollTo,
  onScrollToTop,
}: Props) {
  return (
    <div className="ability-detail-topbar">
      <div className="ability-detail-topbar__identity" onClick={onScrollToTop}>
        <span className="ability-detail-topbar__name">{abilityName}</span>
      </div>

      <nav className="ability-detail-topbar__nav">
        {ABILITY_SECTIONS.map(({ id, label }) => (
          <button
            key={id}
            className={`ability-nav-link ${activeSection === id ? 'ability-nav-link--active' : ''}`}
            onClick={() => (id === 'ability-overview' ? onScrollToTop() : onScrollTo(id))}
          >
            {label}
          </button>
        ))}
      </nav>

      <button className="ability-back-to-top" onClick={onScrollToTop} title="Back to top">
        ↑ Top
      </button>
    </div>
  );
}
