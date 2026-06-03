/* eslint-disable @typescript-eslint/no-explicit-any */
import { useMemo } from 'react';
import { Link } from 'react-router-dom';
import { useData } from '../../../../contexts/dataContext';
import PokemonSprite from '../../../../components/elements/sprites/PokemonSprite';
import './styles.scss';

type Props = {
  itemKey: string;
};

export default function HeldByPokemon({ itemKey }: Props) {
  const { pokemon } = useData();

  const heldBy = useMemo(() => {
    const pArray = (Array.isArray(pokemon) ? pokemon : Object.values(pokemon || {})) as any[];
    return pArray.filter((p) => {
      const items = p.wildItems || p.heldItems || [];
      return items.some((hi: any) => hi.item === itemKey || hi === itemKey);
    });
  }, [pokemon, itemKey]);

  if (heldBy.length === 0) return null;

  return (
    <div className="item-card-style">
      <div className="section-header">Held By Wild Pokémon</div>
      <div className="content">
        <div className="held-by-grid">
          {heldBy.map((p: any) => (
            <Link key={p.key} to={`/pokemon/${p.key}`} className="held-by-link">
              <PokemonSprite name={p.name} size={64} />
              <span className="pokemon-name">{p.name}</span>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
