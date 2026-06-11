import { Link } from 'react-router-dom';
import TypeIconBadge from '../../../../components/elements/typeBadge/TypeIconBadge';
import { TYPE_COLORS } from '../../../pokemonPage/components/pokemonFilterBar/PokemonFilterBar';
import './styles.scss';

type Props = {
  offensive: {
    superEffective: string[];
    notVeryEffective: string[];
    noEffect: string[];
  };
  defensive: {
    weakTo: string[];
    resistantTo: string[];
    immuneTo: string[];
  };
};

function TypeChip({ type }: { type: string }) {
  const color = TYPE_COLORS[type] ?? '#888';
  return (
    <Link to={`/types/${type}`} className="type-matchup-chip" style={{ backgroundColor: color }}>
      <TypeIconBadge type={type} size={16} />
      <span>{type.charAt(0).toUpperCase() + type.slice(1)}</span>
    </Link>
  );
}

function MatchupSection({ title, types, accent }: { title: string; types: string[]; accent: string }) {
  if (types.length === 0) return null;
  return (
    <div className="matchup-section">
      <span className="matchup-section__label" style={{ color: accent }}>{title}</span>
      <div className="matchup-section__chips">
        {types.map((t) => <TypeChip key={t} type={t} />)}
      </div>
    </div>
  );
}

export default function TypeMatchups({ offensive, defensive }: Props) {
  const offensiveEmpty = offensive.superEffective.length === 0 && offensive.notVeryEffective.length === 0 && offensive.noEffect.length === 0;
  const defensiveEmpty = defensive.weakTo.length === 0 && defensive.resistantTo.length === 0 && defensive.immuneTo.length === 0;

  return (
    <div className="type-matchups-grid">
      <div className="type-matchups-card">
        <h3 className="type-matchups-card__title">Offensive</h3>
        <MatchupSection title="Super effective →" types={offensive.superEffective} accent="#3baf6a" />
        <MatchupSection title="Not very effective →" types={offensive.notVeryEffective} accent="#d4862f" />
        <MatchupSection title="No effect →" types={offensive.noEffect} accent="#ef4444" />
        {offensiveEmpty && <p className="type-matchups-card__empty">Normal effectiveness against all types.</p>}
      </div>
      <div className="type-matchups-card">
        <h3 className="type-matchups-card__title">Defensive</h3>
        <MatchupSection title="Weak to ←" types={defensive.weakTo} accent="#ef4444" />
        <MatchupSection title="Resistant to ←" types={defensive.resistantTo} accent="#3baf6a" />
        <MatchupSection title="Immune to ←" types={defensive.immuneTo} accent="#6890f0" />
        {defensiveEmpty && <p className="type-matchups-card__empty">Normal effectiveness from all types.</p>}
      </div>
    </div>
  );
}
