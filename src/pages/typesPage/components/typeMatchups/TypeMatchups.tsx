import { useState } from 'react';
import { Link } from 'react-router-dom';
import TypeIconBadge from '../../../../components/elements/typeBadge/TypeIconBadge';
import CollapseToggle from '../../../../components/elements/collapseToggle/CollapseToggle';
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
  const [isOpen, setIsOpen] = useState(true);

  const offensiveEmpty = offensive.superEffective.length === 0 && offensive.notVeryEffective.length === 0 && offensive.noEffect.length === 0;
  const defensiveEmpty = defensive.weakTo.length === 0 && defensive.resistantTo.length === 0 && defensive.immuneTo.length === 0;

  return (
    <div className={`type-card-style ${isOpen ? '' : 'collapsed'}`}>
      <div className="section-header" onClick={() => setIsOpen(!isOpen)}>
        <CollapseToggle isOpen={isOpen} />
        <span>Type Effectiveness</span>
      </div>
      {isOpen && (
        <div className="content">
          <div className="type-matchups-grid">
            <div className="type-matchups-card">
              <div className="matchups-card__title">Offensive</div>
              <div className="matchups-card__body">
                <MatchupSection title="Super effective →" types={offensive.superEffective} accent="#3baf6a" />
                <MatchupSection title="Not very effective →" types={offensive.notVeryEffective} accent="#d4862f" />
                <MatchupSection title="No effect →" types={offensive.noEffect} accent="#ef4444" />
                {offensiveEmpty && <p className="type-matchups-card__empty">Normal effectiveness against all types.</p>}
              </div>
            </div>
            <div className="type-matchups-card">
              <div className="matchups-card__title">Defensive</div>
              <div className="matchups-card__body">
                <MatchupSection title="Weak to ←" types={defensive.weakTo} accent="#ef4444" />
                <MatchupSection title="Resistant to ←" types={defensive.resistantTo} accent="#3baf6a" />
                <MatchupSection title="Immune to ←" types={defensive.immuneTo} accent="#6890f0" />
                {defensiveEmpty && <p className="type-matchups-card__empty">Normal effectiveness from all types.</p>}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
