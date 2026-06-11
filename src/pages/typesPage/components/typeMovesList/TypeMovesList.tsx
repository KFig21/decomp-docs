/* eslint-disable @typescript-eslint/no-explicit-any */
import { Link } from 'react-router-dom';
import { CategoryIcon } from '../../../../components/elements/categoryBadge/CategoryBadge';
import './styles.scss';

type Props = {
  moves: any[];
  unreleasedKeys?: Set<string>;
};

export default function TypeMovesList({ moves, unreleasedKeys }: Props) {
  return (
    <section className="type-section">
      <h2 className="type-section__title">
        Moves
        <span className="type-section__count">{moves.length}</span>
      </h2>
      {moves.length === 0 ? (
        <p className="type-section__empty">No moves found for this type.</p>
      ) : (
        <div className="type-moves-list">
          {moves.map((move: any) => {
            return (
              <Link key={move.key} to={`/moves/${move.key}`} className={`type-move-row${unreleasedKeys?.has(move.key) ? ' type-move-row--unreleased' : ''}`}>
                <span className="type-move-row__cat">
                  <CategoryIcon raw={move.category || move.split} size={14} />
                </span>
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
  );
}
