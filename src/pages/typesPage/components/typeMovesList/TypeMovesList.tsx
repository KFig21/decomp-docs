/* eslint-disable @typescript-eslint/no-explicit-any */
import { Link } from 'react-router-dom';
import './styles.scss';

type Props = {
  moves: any[];
  unreleasedKeys?: Set<string>;
};

const CATEGORY_ICON: Record<string, string> = {
  Physical: '⚔️',
  Special: '✨',
  Status: '🔮',
};

function normalizeCat(raw: string | undefined): string {
  if (!raw) return 'Status';
  const bare = raw.toUpperCase().replace(/^DAMAGE_CATEGORY_/, '').replace(/^SPLIT_/, '');
  if (bare === 'PHYSICAL') return 'Physical';
  if (bare === 'SPECIAL') return 'Special';
  return 'Status';
}

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
            const category = normalizeCat(move.category || move.split);
            return (
              <Link key={move.key} to={`/moves/${move.key}`} className={`type-move-row${unreleasedKeys?.has(move.key) ? ' type-move-row--unreleased' : ''}`}>
                <span className="type-move-row__cat" title={category}>{CATEGORY_ICON[category]}</span>
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
