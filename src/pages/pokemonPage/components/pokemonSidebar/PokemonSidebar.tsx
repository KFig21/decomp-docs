/* eslint-disable @typescript-eslint/no-explicit-any */
import { useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import PokemonSprite from '../../../../components/elements/sprites/pokemon/PokemonSprite';
import TypeIconBadge from '../../../../components/elements/typeBadge/TypeIconBadge';
import './styles.scss';

type Props = {
  filteredPokemon: any[];
  activeId?: string;
  selectedDex: string;
};

export default function PokemonSidebar({ filteredPokemon, activeId, selectedDex }: Props) {
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
          const isUnreleased = !mon.isSeen && !mon.isObtainable;

          return (
            <div
              key={mon.key}
              ref={isActive ? activeItemRef : null}
              className={`pokemon-list-item ${isActive ? 'active' : ''} ${isUnreleased ? 'pokemon-list-item--unreleased' : ''}`}
              onClick={() => navigate(`/pokemon/${mon.key}`)}
            >
              <div className="sprite-wrapper">
                <PokemonSprite name={mon.name} />
              </div>
              <div className="pokemon-name">
                {(() => {
                  const num =
                    (mon.dexNums as Record<string, number> | undefined)?.[selectedDex] ??
                    (selectedDex === 'NATIONAL_DEX' && typeof mon.natDexNum === 'number'
                      ? mon.natDexNum
                      : null);
                  return num != null ? (
                    <span className="sidebar-dex-num">#{String(num).padStart(3, '0')}{' '}</span>
                  ) : null;
                })()}
                {mon.name}
              </div>
              <div className="pokemon-types">
                {uniqueTypes.map((type) => (
                  <TypeIconBadge key={type} type={type} size={20} />
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
