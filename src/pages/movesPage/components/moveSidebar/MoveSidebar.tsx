/* eslint-disable @typescript-eslint/no-explicit-any */
import { useRef, useEffect } from 'react';
import { Link } from 'react-router-dom';
import TypeBadge from '../../../../components/elements/typeBadge/TypeBadge';
import { CategoryIcon } from '../../../../components/elements/categoryBadge/CategoryBadge';
import { normalizeMoveCategory, normalizeTypeName } from '../../MovesPage';
import './styles.scss';

type Props = {
  filteredMoves: any[];
  activeId?: string;
  tmByMove: Record<string, any>;
  learnableMoveKeys: Set<string>;
};

export default function MoveSidebar({ filteredMoves, activeId, tmByMove, learnableMoveKeys }: Props) {
  const activeRef = useRef<HTMLAnchorElement>(null);

  useEffect(() => {
    if (activeRef.current) {
      activeRef.current.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    }
  }, [activeId]);

  return (
    <div className="moves-sidebar">
      {filteredMoves.length === 0 && (
        <p className="moves-sidebar__empty">No moves match your filters.</p>
      )}
      {filteredMoves.map((move: any) => {
        const isActive = move.key === activeId;
        const typeName = normalizeTypeName(move.type);
        const category = normalizeMoveCategory(move.category || move.split);
        const hasTm = !!tmByMove[move.key];
        const isUnreleased = !learnableMoveKeys.has(move.key);

        return (
          <Link
            key={move.key}
            ref={isActive ? activeRef : null}
            to={`/moves/${move.key}`}
            className={`moves-sidebar-item ${isActive ? 'active' : ''} ${isUnreleased ? 'moves-sidebar-item--unreleased' : ''}`}
          >
            <div className="move-type-col">
              {typeName && <TypeBadge type={`TYPE_${typeName.toUpperCase()}`} noLink />}
            </div>
            <div className="move-name-col">
              <span className="move-name">{move.name}</span>
              {hasTm && <span className="tm-badge">TM</span>}
            </div>
            <div className="move-meta-col">
              <span className="move-cat-icon" title={category}>
                <CategoryIcon raw={move.category || move.split} size={14} />
              </span>
              <span className="move-power">{move.power ? `${move.power}` : '—'}</span>
            </div>
          </Link>
        );
      })}
    </div>
  );
}
