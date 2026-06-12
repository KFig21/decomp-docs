/* eslint-disable @typescript-eslint/no-explicit-any */
import PokemonSprite from '../../../../components/elements/sprites/pokemon/PokemonSprite';
import TypeBadge from '../../../../components/elements/typeBadge/TypeBadge';
import './styles.scss';

export const TOPBAR_HEIGHT = 52;

export const SECTIONS = [
  { id: 'poke-overview', label: 'Overview' },
  { id: 'poke-evolution', label: 'Evolution' },
  { id: 'poke-stats', label: 'Stats' },
  { id: 'poke-held-items', label: 'Held Items' },
  { id: 'poke-moves', label: 'Moves' },
  { id: 'poke-tmhm', label: 'TM / Tutor' },
  { id: 'poke-locations', label: 'Locations' },
  { id: 'poke-trainers', label: 'Trainers' },
] as const;

export type SectionId = (typeof SECTIONS)[number]['id'];

interface Props {
  activeVariant: any;
  activeSection: SectionId;
  scrollToSection: (sectionId: SectionId) => void;
  scrollToTop: () => void;
}

export default function PokemonTopBar({
  activeVariant,
  activeSection,
  scrollToSection,
  scrollToTop,
}: Props) {
  return (
    <div className="pokemon-detail-topbar">
      <div className="pokemon-detail-topbar__identity" onClick={scrollToTop}>
        <PokemonSprite name={activeVariant.name} size={44} />
        <span className="pokemon-detail-topbar__name">{activeVariant.name}</span>
        {activeVariant.types && (
          <div className="pokemon-detail-topbar__types">
            {(activeVariant.types as string[]).filter(Boolean).map((t: string) => (
              <TypeBadge key={t} type={t} />
            ))}
          </div>
        )}
      </div>

      <nav className="pokemon-detail-topbar__nav">
        {SECTIONS.map(({ id: sId, label }) => (
          <button
            key={sId}
            className={`poke-nav-link ${activeSection === sId ? 'poke-nav-link--active' : ''}`}
            onClick={() => (sId === 'poke-overview' ? scrollToTop() : scrollToSection(sId))}
          >
            {label}
          </button>
        ))}
      </nav>

      <button className="poke-back-to-top" onClick={scrollToTop} title="Back to top">
        ↑ Top
      </button>
    </div>
  );
}
