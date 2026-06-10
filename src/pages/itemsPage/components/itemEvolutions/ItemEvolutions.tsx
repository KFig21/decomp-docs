/* eslint-disable @typescript-eslint/no-explicit-any */
import { useMemo } from 'react';
import { Link } from 'react-router-dom';
import { useData } from '../../../../contexts/dataContext';
import PokemonSprite from '../../../../components/elements/sprites/pokemon/PokemonSprite';
import TypeBadge from '../../../../components/elements/typeBadge/TypeBadge';
import './styles.scss';

type Props = { item: any };

type EvoPair = {
  from: any;
  to: any;
  isTrade: boolean;
};

export default function ItemEvolutions({ item }: Props) {
  const { pokemon } = useData();

  const pairs: EvoPair[] = useMemo(() => {
    const pokemonRecord: Record<string, any> = Array.isArray(pokemon)
      ? Object.fromEntries((pokemon as any[]).map((p) => [p.key, p]))
      : ((pokemon as Record<string, any>) ?? {});

    const results: EvoPair[] = [];

    for (const mon of Object.values(pokemonRecord)) {
      for (const evo of mon.evolutions ?? []) {
        const method = (evo.method as string | undefined)?.replace('EVO_', '');
        if ((method === 'ITEM' || method === 'TRADE_ITEM') && evo.param === item.key) {
          const target = pokemonRecord[evo.targetSpecies];
          if (target) {
            results.push({ from: mon, to: target, isTrade: method === 'TRADE_ITEM' });
          }
        }
      }
    }

    return results;
  }, [pokemon, item]);

  if (pairs.length === 0) return null;

  return (
    <div className="item-card-style">
      <div className="section-header">
        <span>Evolutions Using This Item ({pairs.length})</span>
      </div>
      <div className="content">
        <div className="item-evo-list">
          {pairs.map(({ from, to, isTrade }, i) => (
            <div key={i} className="item-evo-row">
              <EvoPokemonCard mon={from} />
              <div className="item-evo-arrow">
                <span className="item-evo-arrow__line">→</span>
                {isTrade && <span className="item-evo-badge item-evo-badge--trade">Trade</span>}
              </div>
              <EvoPokemonCard mon={to} isResult />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function EvoPokemonCard({ mon, isResult = false }: { mon: any; isResult?: boolean }) {
  return (
    <Link
      to={`/pokemon/${mon.key}`}
      className={`item-evo-card ${isResult ? 'item-evo-card--result' : ''}`}
    >
      <PokemonSprite name={mon.name} size={72} />
      <div className="item-evo-card__info">
        <span className="item-evo-card__name">{mon.name}</span>
        {mon.types && (
          <div className="item-evo-card__types">
            {(mon.types as string[]).filter(Boolean).map((t) => (
              <TypeBadge key={t} type={t} />
            ))}
          </div>
        )}
      </div>
    </Link>
  );
}
