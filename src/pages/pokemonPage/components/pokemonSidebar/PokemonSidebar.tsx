/* eslint-disable @typescript-eslint/no-explicit-any */
import { useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import PokemonSprite from '../../../../components/elements/sprites/PokemonSprite';
import TypeBadge from '../../../../components/elements/typeBadge/TypeBadge';
import './styles.scss';

type Props = {
  filteredPokemon: any[];
  activeId?: string;
};

export default function PokemonSidebar({ filteredPokemon, activeId }: Props) {
  const navigate = useNavigate();
  const activeItemRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (activeItemRef.current) {
      activeItemRef.current.scrollIntoView({
        behavior: 'smooth',
        block: 'center',
      });
    }
  }, [activeId]);

  return (
    <div className="pokemon-sidebar">
      <div className="pokemon-list">
        {filteredPokemon.length === 0 && (
          <p className="empty-state" style={{ padding: 16, textAlign: 'center' }}>
            No Pokémon match your filters.
          </p>
        )}

        {filteredPokemon.map((mon) => {
          const uniqueTypes = Array.from(new Set(mon.types ?? [])).filter(Boolean) as string[];
          const bst = mon.baseStats
            ? Object.values(mon.baseStats).reduce((a: any, c: any) => Number(a) + Number(c), 0)
            : 0;
          const isActive = mon.key === activeId;

          return (
            <div
              key={mon.key}
              ref={isActive ? activeItemRef : null}
              className={`pokemon-list-item ${isActive ? 'active' : ''}`}
              onClick={() => navigate(`/pokemon/${mon.key}`)}
            >
              <div className="sprite-wrapper">
                <PokemonSprite name={mon.name} />
              </div>
              <div className="pokemon-name">{mon.name}</div>
              <div className="pokemon-types">
                {uniqueTypes.map((type) => (
                  <TypeBadge key={type} type={type} />
                ))}
              </div>
              <div className="pokemon-bst">{bst as number} BST</div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
