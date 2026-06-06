/* eslint-disable @typescript-eslint/no-explicit-any */
import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { useData } from '../../../../contexts/dataContext';
import PokemonSprite from '../../../../components/elements/sprites/pokemon/PokemonSprite';
import './styles.scss';

type Props = { item: any };
type HeldChance = 'common' | 'uncommon' | 'rare';

const CHANCE_META: Record<HeldChance, { label: string; pct: string; mod: string }> = {
  common: { label: 'Common', pct: '50%', mod: 'common' },
  uncommon: { label: 'Uncommon', pct: '5%', mod: 'uncommon' },
  rare: { label: 'Rare', pct: '1%', mod: 'rare' },
};

export default function HeldByPokemon({ item }: Props) {
  const { pokemon } = useData();
  const [hideUnavailable, setHideUnavailable] = useState(false);

  const holders = useMemo(() => {
    const pokemonRecord: Record<string, any> = Array.isArray(pokemon)
      ? Object.fromEntries((pokemon as any[]).map((p) => [p.key, p]))
      : ((pokemon as Record<string, any>) ?? {});

    let raw: { mon: any; chance: HeldChance }[] = [];

    if (item.wildHolders && item.wildHolders.length > 0) {
      raw = item.wildHolders
        .map((ref: { speciesKey: string; chance: HeldChance }) => ({
          mon: pokemonRecord[ref.speciesKey],
          chance: ref.chance,
        }))
        .filter(({ mon }: { mon: any }) => !!mon);
    } else {
      const pArray = Object.values(pokemonRecord) as any[];
      raw = pArray
        .filter((p) => {
          const its = p.wildItems || p.heldItems || [];
          return its.some((hi: any) => hi.item === item.key || hi === item.key);
        })
        .map((mon) => ({ mon, chance: 'common' as HeldChance }));
    }

    // ── Sort: available (seen/obtainable) first, unavailable last ──
    return [...raw].sort((a, b) => {
      const aAvail = a.mon.isSeen || a.mon.isObtainable ? 0 : 1;
      const bAvail = b.mon.isSeen || b.mon.isObtainable ? 0 : 1;
      return aAvail - bAvail;
    });
  }, [pokemon, item]);

  if (holders.length === 0) return null;

  const unavailableCount = holders.filter(
    ({ mon }: { mon: any }) => !mon.isSeen && !mon.isObtainable,
  ).length;

  const displayed = hideUnavailable
    ? holders.filter(({ mon }: { mon: any }) => mon.isSeen || mon.isObtainable)
    : holders;

  return (
    <div className="item-card-style">
      <div className="section-header held-by-header">
        <span>Held By Wild Pokémon</span>
        {unavailableCount > 0 && (
          <button
            className={`toggle-unavailable ${hideUnavailable ? 'active' : ''}`}
            onClick={() => setHideUnavailable((v) => !v)}
          >
            {hideUnavailable
              ? `Show all (${unavailableCount} hidden)`
              : `Hide unavailable (${unavailableCount})`}
          </button>
        )}
      </div>
      <div className="content">
        <div className="held-by-grid">
          {displayed.map(({ mon, chance }: { mon: any; chance: HeldChance }) => {
            const meta = CHANCE_META[chance] ?? CHANCE_META.common;
            const isAvailable = mon.isSeen || mon.isObtainable;
            return (
              <Link
                key={`${mon.key}-${chance}`}
                to={`/pokemon/${mon.key}`}
                className={`held-by-link ${!isAvailable ? 'held-by-link--unavailable' : ''}`}
                title={!isAvailable ? `${mon.name} is not available in this game` : undefined}
              >
                <div className="sprite-wrap">
                  <PokemonSprite name={mon.name} size={64} />
                </div>
                <span className="pokemon-name">{mon.name}</span>
                <span className={`chance-badge chance-badge--${meta.mod}`} title={meta.pct}>
                  {meta.label}
                </span>
                {!isAvailable && <span className="unavailable-label">Not in game</span>}
              </Link>
            );
          })}
        </div>
      </div>
    </div>
  );
}
