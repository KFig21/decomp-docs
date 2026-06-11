/* eslint-disable @typescript-eslint/no-explicit-any */
import { useMemo } from 'react';
import { Link } from 'react-router-dom';
import PokemonSprite from '../../../../components/elements/sprites/pokemon/PokemonSprite';
import TypeIconBadge from '../../../../components/elements/typeBadge/TypeIconBadge';
import { TYPE_COLORS } from '../../../pokemonPage/components/pokemonFilterBar/PokemonFilterBar';
import './styles.scss';

// ── Gen 6+ type effectiveness chart ──────────────────────────────────────────
// TYPE_CHART[attacker][defender] = multiplier (only non-1x entries stored)
const TYPE_CHART: Record<string, Record<string, number>> = {
  normal:   { rock: 0.5, steel: 0.5, ghost: 0 },
  fire:     { grass: 2, ice: 2, bug: 2, steel: 2, fire: 0.5, water: 0.5, rock: 0.5, dragon: 0.5 },
  water:    { fire: 2, ground: 2, rock: 2, water: 0.5, grass: 0.5, dragon: 0.5 },
  electric: { water: 2, flying: 2, electric: 0.5, grass: 0.5, ground: 0, dragon: 0.5 },
  grass:    { water: 2, ground: 2, rock: 2, fire: 0.5, grass: 0.5, poison: 0.5, flying: 0.5, bug: 0.5, dragon: 0.5, steel: 0.5 },
  ice:      { grass: 2, ground: 2, flying: 2, dragon: 2, fire: 0.5, water: 0.5, ice: 0.5, steel: 0.5 },
  fighting: { normal: 2, ice: 2, rock: 2, dark: 2, steel: 2, poison: 0.5, flying: 0.5, psychic: 0.5, bug: 0.5, ghost: 0, fairy: 0.5 },
  poison:   { grass: 2, fairy: 2, poison: 0.5, ground: 0.5, rock: 0.5, ghost: 0.5, steel: 0 },
  ground:   { fire: 2, electric: 2, poison: 2, rock: 2, steel: 2, grass: 0.5, bug: 0.5, flying: 0 },
  flying:   { grass: 2, fighting: 2, bug: 2, electric: 0.5, rock: 0.5, steel: 0.5 },
  psychic:  { fighting: 2, poison: 2, psychic: 0.5, steel: 0.5, dark: 0 },
  bug:      { grass: 2, psychic: 2, dark: 2, fire: 0.5, fighting: 0.5, flying: 0.5, ghost: 0.5, steel: 0.5, fairy: 0.5 },
  rock:     { fire: 2, ice: 2, flying: 2, bug: 2, fighting: 0.5, ground: 0.5, steel: 0.5 },
  ghost:    { psychic: 2, ghost: 2, normal: 0, dark: 0.5 },
  dragon:   { dragon: 2, steel: 0.5, fairy: 0 },
  dark:     { psychic: 2, ghost: 2, fighting: 0.5, dark: 0.5, fairy: 0.5 },
  steel:    { ice: 2, rock: 2, fairy: 2, fire: 0.5, water: 0.5, electric: 0.5, steel: 0.5 },
  fairy:    { fighting: 2, dragon: 2, dark: 2, fire: 0.5, poison: 0.5, steel: 0.5 },
};

const ALL_TYPES = Object.keys(TYPE_CHART);

function getOffensive(type: string) {
  const row = TYPE_CHART[type] ?? {};
  return {
    superEffective:   ALL_TYPES.filter((t) => (row[t] ?? 1) === 2),
    notVeryEffective: ALL_TYPES.filter((t) => (row[t] ?? 1) === 0.5),
    noEffect:         ALL_TYPES.filter((t) => (row[t] ?? 1) === 0),
  };
}

function getDefensive(type: string) {
  const weakTo: string[] = [];
  const resistantTo: string[] = [];
  const immuneTo: string[] = [];
  for (const attacker of ALL_TYPES) {
    const mult = TYPE_CHART[attacker]?.[type] ?? 1;
    if (mult === 2)        weakTo.push(attacker);
    else if (mult === 0.5) resistantTo.push(attacker);
    else if (mult === 0)   immuneTo.push(attacker);
  }
  return { weakTo, resistantTo, immuneTo };
}

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

const CATEGORY_ICON: Record<string, string> = {
  Physical: '⚔️',
  Special: '✨',
  Status: '🔮',
};

function normalizeCat(raw: string | undefined): string {
  if (!raw) return 'Status';
  const bare = raw.toUpperCase().replace(/^DAMAGE_CATEGORY_/, '').replace(/^SPLIT_/, '');
  if (bare === 'PHYSICAL') return 'Physical';
  if (bare === 'SPECIAL') return 'Special';
  return 'Status';
}

type Props = {
  typeId: string;
  pokemonArray: any[];
  movesArray: any[];
  primaryOnly: boolean;
};

export default function TypeDetailPage({ typeId, pokemonArray, movesArray, primaryOnly }: Props) {
  const typeLower = typeId.toLowerCase();
  const typeLabel = typeLower.charAt(0).toUpperCase() + typeLower.slice(1);
  const typeColor = TYPE_COLORS[typeLower] ?? 'var(--primaryColor)';

  const offensive = useMemo(() => getOffensive(typeLower), [typeLower]);
  const defensive = useMemo(() => getDefensive(typeLower), [typeLower]);

  const typePokemon = useMemo(
    () =>
      pokemonArray
        .filter((mon: any) => {
          if (mon.baseSpeciesKey) return false;
          if (!mon.isSeen && !mon.isObtainable) return false;
          const types = (mon.types ?? []) as string[];
          if (primaryOnly) {
            return (types[0] ?? '').replace(/^TYPE_/i, '').toLowerCase() === typeLower;
          }
          return types
            .filter(Boolean)
            .some((t: string) => t.replace(/^TYPE_/i, '').toLowerCase() === typeLower);
        })
        .sort((a: any, b: any) => {
          const aNum = typeof a.natDexNum === 'number' ? a.natDexNum : 99999;
          const bNum = typeof b.natDexNum === 'number' ? b.natDexNum : 99999;
          return aNum - bNum;
        }),
    [pokemonArray, typeLower, primaryOnly],
  );

  const typeMoves = useMemo(
    () =>
      movesArray
        .filter((move: any) => (move.type ?? '').replace(/^TYPE_/i, '').toLowerCase() === typeLower)
        .sort((a: any, b: any) => (a.name ?? '').localeCompare(b.name ?? '')),
    [movesArray, typeLower],
  );

  return (
    <div className="type-detail-page">
      {/* ── Header ── */}
      <div className="type-detail-header" style={{ borderColor: typeColor }}>
        <TypeIconBadge type={typeLower} size={48} />
        <h1 className="type-detail-header__name" style={{ color: typeColor }}>{typeLabel}</h1>
        <div className="type-detail-header__counts">
          <span className="type-detail-header__count">{typePokemon.length} Pokémon</span>
          <span className="type-detail-header__sep">·</span>
          <span className="type-detail-header__count">{typeMoves.length} Moves</span>
        </div>
      </div>

      {/* ── Matchups ── */}
      <div className="type-matchups-grid">
        <div className="type-matchups-card">
          <h3 className="type-matchups-card__title">Offensive</h3>
          <MatchupSection title="Super effective →" types={offensive.superEffective} accent="#3baf6a" />
          <MatchupSection title="Not very effective →" types={offensive.notVeryEffective} accent="#d4862f" />
          <MatchupSection title="No effect →" types={offensive.noEffect} accent="#ef4444" />
          {offensive.superEffective.length === 0 && offensive.notVeryEffective.length === 0 && offensive.noEffect.length === 0 && (
            <p className="type-matchups-card__empty">Normal effectiveness against all types.</p>
          )}
        </div>
        <div className="type-matchups-card">
          <h3 className="type-matchups-card__title">Defensive</h3>
          <MatchupSection title="Weak to ←" types={defensive.weakTo} accent="#ef4444" />
          <MatchupSection title="Resistant to ←" types={defensive.resistantTo} accent="#3baf6a" />
          <MatchupSection title="Immune to ←" types={defensive.immuneTo} accent="#6890f0" />
          {defensive.weakTo.length === 0 && defensive.resistantTo.length === 0 && defensive.immuneTo.length === 0 && (
            <p className="type-matchups-card__empty">Normal effectiveness from all types.</p>
          )}
        </div>
      </div>

      {/* ── Pokémon ── */}
      <section className="type-section">
        <h2 className="type-section__title">
          Pokémon
          <span className="type-section__count">{typePokemon.length}</span>
        </h2>
        {typePokemon.length === 0 ? (
          <p className="type-section__empty">No Pokémon found for this type.</p>
        ) : (
          <div className="type-pokemon-grid">
            {typePokemon.map((mon: any) => {
              const uniqueTypes = Array.from(new Set(mon.types ?? [])).filter(Boolean) as string[];
              return (
                <Link key={mon.key} to={`/pokemon/${mon.key}`} className="type-pokemon-card">
                  <PokemonSprite name={mon.name} size={48} />
                  <span className="type-pokemon-card__name">{mon.name}</span>
                  <div className="type-pokemon-card__types">
                    {uniqueTypes.map((t) => <TypeIconBadge key={t} type={t} size={16} />)}
                  </div>
                </Link>
              );
            })}
          </div>
        )}
      </section>

      {/* ── Moves ── */}
      <section className="type-section">
        <h2 className="type-section__title">
          Moves
          <span className="type-section__count">{typeMoves.length}</span>
        </h2>
        {typeMoves.length === 0 ? (
          <p className="type-section__empty">No moves found for this type.</p>
        ) : (
          <div className="type-moves-list">
            {typeMoves.map((move: any) => {
              const category = normalizeCat(move.category || move.split);
              return (
                <Link key={move.key} to={`/moves/${move.key}`} className="type-move-row">
                  <span className="type-move-row__cat" title={category}>{CATEGORY_ICON[category]}</span>
                  <span className="type-move-row__name">{move.name}</span>
                  <span className="type-move-row__power">{move.power ? `${move.power}` : '—'}</span>
                  <span className="type-move-row__acc">{move.accuracy != null ? `${move.accuracy}%` : '—'}</span>
                  <span className="type-move-row__pp">{move.pp != null ? `${move.pp} PP` : ''}</span>
                </Link>
              );
            })}
          </div>
        )}
      </section>
    </div>
  );
}
