/* eslint-disable @typescript-eslint/no-explicit-any */
import { Link } from 'react-router-dom';
import PokemonSprite from '../../../../components/elements/sprites/pokemon/PokemonSprite';
import TypeIconBadge from '../../../../components/elements/typeBadge/TypeIconBadge';
import './styles.scss';

type Props = {
  pokemon: any[];
  unreleasedKeys?: Set<string>;
};

export default function TypePokemonList({ pokemon, unreleasedKeys }: Props) {
  return (
    <section className="type-card-style">
      <div className="section-header">
        Pokémon
        <span className="type-section__count">{pokemon.length}</span>
      </div>
      <div className="content">
        {pokemon.length === 0 ? (
          <p className="type-section__empty">No Pokémon found for this type.</p>
        ) : (
          <div className="type-pokemon-grid">
            {pokemon.map((mon: any) => {
              const uniqueTypes = Array.from(new Set(mon.types ?? [])).filter(Boolean) as string[];
              return (
                <Link key={mon.key} to={`/pokemon/${mon.key}`} className={`type-pokemon-card${unreleasedKeys?.has(mon.key) ? ' type-pokemon-card--unreleased' : ''}`}>
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
      </div>
    </section>
  );
}
