/* eslint-disable @typescript-eslint/no-explicit-any */
import { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import CategoryBadge from '../../../../components/elements/categoryBadge/CategoryBadge';
import { normalizeCategory } from '../../../../components/elements/categoryBadge/CategoryBadge';
import { useData } from '../../../../contexts/dataContext';
import './styles.scss';

type Props = {
  moves: any[];
  unreleasedKeys?: Set<string>;
};

type SortCol = 'name' | 'category' | 'power' | 'accuracy' | 'pp';
type SortDir = 'asc' | 'desc';

function getTmLabel(item: any): string {
  const prefix = item.key?.startsWith('ITEM_HM') ? 'HM' : 'TM';
  const keyNum = item.key?.match(/ITEM_(?:TM|HM)(\d+)/)?.[1];
  const nameNum = item.name?.match(/^(?:TM|HM)(\d+)$/i)?.[1];
  const rawNum = keyNum ?? nameNum;
  const num = rawNum ? String(Number(rawNum)).padStart(2, '0') : '';
  return num ? `${prefix}${num}` : prefix;
}

const formatStat = (v: number | undefined) => (!v || v === 0 ? '—' : v);

export default function TypeMovesList({ moves, unreleasedKeys }: Props) {
  const { items } = useData();
  const [sortCol, setSortCol] = useState<SortCol>('name');
  const [sortDir, setSortDir] = useState<SortDir>('asc');

  const tmByMove = useMemo(() => {
    const map: Record<string, any> = {};
    for (const item of Object.values(items || {}) as any[]) {
      if (!item.key?.startsWith('ITEM_TM') && !item.key?.startsWith('ITEM_HM')) continue;
      const moveKey = 'MOVE_' + item.key.replace(/^ITEM_(TM\d+_|HM\d+_|TM_|HM_)/, '');
      if (!map[moveKey]) map[moveKey] = item;
    }
    return map;
  }, [items]);

  const sorted = useMemo(() => {
    const arr = [...moves];
    const dir = sortDir === 'asc' ? 1 : -1;
    arr.sort((a, b) => {
      switch (sortCol) {
        case 'name':     return dir * (a.name ?? '').localeCompare(b.name ?? '');
        case 'category': return dir * normalizeCategory(a.category || a.split).localeCompare(normalizeCategory(b.category || b.split));
        case 'power':    return dir * ((a.power ?? 0) - (b.power ?? 0));
        case 'accuracy': return dir * ((a.accuracy ?? 0) - (b.accuracy ?? 0));
        case 'pp':       return dir * ((a.pp ?? 0) - (b.pp ?? 0));
        default:         return 0;
      }
    });
    return arr;
  }, [moves, sortCol, sortDir]);

  const handleSort = (col: SortCol) => {
    if (col === sortCol) setSortDir(d => d === 'asc' ? 'desc' : 'asc');
    else { setSortCol(col); setSortDir('asc'); }
  };

  const sortIndicator = (col: SortCol) => {
    if (col !== sortCol) return ' ↕';
    return sortDir === 'asc' ? ' ↑' : ' ↓';
  };

  return (
    <section className="type-card-style">
      <div className="section-header">
        Moves
        <span className="type-section__count">{moves.length}</span>
      </div>
      {moves.length === 0 ? (
        <div className="content"><p className="type-section__empty">No moves found for this type.</p></div>
      ) : (
        <div className="content" style={{ overflowX: 'auto' }}>
          <table className="type-moves-table">
            <thead>
              <tr>
                <th className="sortable" onClick={() => handleSort('name')}>Name{sortIndicator('name')}</th>
                <th className="center col-cat sortable" onClick={() => handleSort('category')}>Category{sortIndicator('category')}</th>
                <th className="center col-power sortable" onClick={() => handleSort('power')}>Power{sortIndicator('power')}</th>
                <th className="center col-acc sortable" onClick={() => handleSort('accuracy')}>Accuracy{sortIndicator('accuracy')}</th>
                <th className="center col-pp sortable" onClick={() => handleSort('pp')}>PP{sortIndicator('pp')}</th>
              </tr>
            </thead>
            <tbody>
              {sorted.map((move: any) => {
                const tmItem = tmByMove[move.key];
                const isUnreleased = unreleasedKeys?.has(move.key);
                return (
                  <tr key={move.key} className={isUnreleased ? 'row--unreleased' : ''}>
                    <td>
                      <div className="move-name-cell">
                        <Link to={`/moves/${move.key}`} className="learnset-link">
                          {move.name}
                        </Link>
                        {tmItem && (
                          <Link to={`/items/${tmItem.key}`} className="learnset-link learnset-link--tm">
                            {getTmLabel(tmItem)}
                          </Link>
                        )}
                      </div>
                    </td>
                    <td className="center">
                      <CategoryBadge raw={move.category || move.split} showIcon />
                    </td>
                    <td className="center">{formatStat(move.power)}</td>
                    <td className="center">{move.accuracy != null && move.accuracy > 0 ? `${move.accuracy}%` : '—'}</td>
                    <td className="center">{formatStat(move.pp)}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </section>
  );
}

