import { useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import TypeIconBadge from '../../../../components/elements/typeBadge/TypeIconBadge';
import './styles.scss';

type Props = {
  filteredTypes: string[];
  typeStats: Record<string, { pokemonCount: number; moveCount: number }>;
  activeId?: string;
};

export default function TypesSidebar({ filteredTypes, typeStats, activeId }: Props) {
  const navigate = useNavigate();
  const activeRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (activeRef.current) {
      activeRef.current.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    }
  }, [activeId]);

  return (
    <div className="types-sidebar">
      {filteredTypes.length === 0 && (
        <p className="types-sidebar__empty">No types match your search.</p>
      )}
      {filteredTypes.map((type) => {
        const id = type.toLowerCase();
        const isActive = id === activeId;
        const stats = typeStats[type] ?? { pokemonCount: 0, moveCount: 0 };

        return (
          <div
            key={type}
            ref={isActive ? activeRef : null}
            className={`types-sidebar-item ${isActive ? 'active' : ''}`}
            onClick={() => navigate(`/types/${id}`)}
          >
            <div className="types-sidebar-item__icon">
              <TypeIconBadge type={type} size={28} />
            </div>
            <span className="types-sidebar-item__name">{type}</span>
            <div className="types-sidebar-item__counts">
              <span className="types-sidebar-item__count types-sidebar-item__count--pokemon" title="Pokémon">
                {stats.pokemonCount}
              </span>
              <span className="types-sidebar-item__count types-sidebar-item__count--moves" title="Moves">
                {stats.moveCount}
              </span>
            </div>
          </div>
        );
      })}
    </div>
  );
}
