/* eslint-disable @typescript-eslint/no-explicit-any */
import { useMemo } from 'react';
import { Link } from 'react-router-dom';
import { useData } from '../../../../contexts/dataContext';
import PokemonSprite from '../../../../components/elements/sprites/PokemonSprite';
import './styles.scss';

type Props = {
  item: any; // full ParsedItem, so we can read item.wildHolders
};

type HeldChance = 'common' | 'uncommon' | 'rare';

const CHANCE_META: Record<HeldChance, { label: string; pct: string; mod: string }> = {
  common: { label: 'Common', pct: '50%', mod: 'common' },
  uncommon: { label: 'Uncommon', pct: '5%', mod: 'uncommon' },
  rare: { label: 'Rare', pct: '1%', mod: 'rare' },
};

export default function HeldByPokemon({ item }: Props) {
  const { pokemon } = useData();

  // Prefer the new wildHolders[] structure (populated by attachWildHeldItems).
  // Fall back to the old heldItems / wildItems scan for backwards compat.
  const holders = useMemo(() => {
    // New path: item.wildHolders = [{ speciesKey, chance }]
    if (item.wildHolders && item.wildHolders.length > 0) {
      const pokemonRecord = Array.isArray(pokemon)
        ? Object.fromEntries((pokemon as any[]).map((p) => [p.key, p]))
        : (pokemon as Record<string, any>);

      return item.wildHolders
        .map((ref: { speciesKey: string; chance: HeldChance }) => ({
          mon: pokemonRecord[ref.speciesKey],
          chance: ref.chance,
        }))
        .filter(({ mon }: { mon: any }) => !!mon);
    }

    // Legacy fallback: scan pokemon for wildItems / heldItems containing this key
    const pArray = (Array.isArray(pokemon) ? pokemon : Object.values(pokemon || {})) as any[];
    return pArray
      .filter((p) => {
        const items = p.wildItems || p.heldItems || [];
        return items.some((hi: any) => hi.item === item.key || hi === item.key);
      })
      .map((mon) => ({ mon, chance: 'common' as HeldChance }));
  }, [pokemon, item]);

  if (holders.length === 0) return null;

  return (
    <div className="item-card-style">
      <div className="section-header">Held By Wild Pokémon</div>
      <div className="content">
        <div className="held-by-grid">
          {holders.map(({ mon, chance }: { mon: any; chance: HeldChance }) => {
            const meta = CHANCE_META[chance] ?? CHANCE_META.common;
            return (
              <Link
                key={`${mon.key}-${chance}`}
                to={`/pokemon/${mon.key}`}
                className="held-by-link"
              >
                <div className="sprite-wrap">
                  <PokemonSprite name={mon.name} size={64} />
                </div>
                <span className="pokemon-name">{mon.name}</span>
                <span className={`chance-badge chance-badge--${meta.mod}`} title={meta.pct}>
                  {meta.label}
                </span>
              </Link>
            );
          })}
        </div>
      </div>
    </div>
  );
}
