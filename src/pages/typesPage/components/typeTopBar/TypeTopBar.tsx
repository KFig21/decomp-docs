import TypeIconBadge from '../../../../components/elements/typeBadge/TypeIconBadge';
import { TYPE_COLORS } from '../../../pokemonPage/components/pokemonFilterBar/PokemonFilterBar';
import './styles.scss';

export const TOPBAR_HEIGHT = 52;

export const SECTIONS = [
  { id: 'type-overview',    label: 'Overview' },
  { id: 'type-matchups',    label: 'Type Effectiveness' },
  { id: 'type-pokemon',     label: 'Pokémon' },
  { id: 'type-moves',       label: 'Moves' },
] as const;

export type SectionId = (typeof SECTIONS)[number]['id'];

interface Props {
  type: string;
  activeSection: SectionId;
  scrollToSection: (sectionId: SectionId) => void;
  scrollToTop: () => void;
}

export default function TypeTopBar({ type, activeSection, scrollToSection, scrollToTop }: Props) {
  const typeLabel = type.charAt(0).toUpperCase() + type.slice(1);
  const typeColor = TYPE_COLORS[type] ?? 'var(--primaryColor)';

  return (
    <div className="type-detail-topbar">
      <div className="type-detail-topbar__identity" onClick={scrollToTop}>
        <TypeIconBadge type={type} size={28} />
        <span className="type-detail-topbar__name" style={{ color: typeColor }}>
          {typeLabel}
        </span>
      </div>

      <nav className="type-detail-topbar__nav">
        {SECTIONS.map(({ id: sId, label }) => (
          <button
            key={sId}
            className={`type-nav-link ${activeSection === sId ? 'type-nav-link--active' : ''}`}
            onClick={() => sId === 'type-overview' ? scrollToTop() : scrollToSection(sId)}
          >
            {label}
          </button>
        ))}
      </nav>

      <button className="type-back-to-top" onClick={scrollToTop} title="Back to top">
        ↑ Top
      </button>
    </div>
  );
}
