/* eslint-disable @typescript-eslint/no-explicit-any */
import { useState } from 'react';
import { Link } from 'react-router-dom';
import CollapseToggle from '../../../../components/elements/collapseToggle/CollapseToggle';
import { formatReadableName } from '../../../../utils/functions';
import TypeBadge from '../../../../components/elements/typeBadge/TypeBadge';
import CategoryBadge from '../../../../components/elements/categoryBadge/CategoryBadge';
import './styles.scss';

type Props = { learnset: any[] };

const formatNumber = (num?: number) => {
  if (!num || num === 0) return '—';
  return num;
};

export default function Learnset({ learnset }: Props) {
  const [isOpen, setIsOpen] = useState(true);

  return (
    <div className={`section pokemon-card-style ${isOpen ? '' : 'collapsed'}`}>
      <div className="section-header" onClick={() => setIsOpen(!isOpen)}>
        <CollapseToggle isOpen={isOpen} />
        <span>Level Up Moves</span>
      </div>
      {isOpen && (
        <div className="table-container content" style={{ overflowX: 'auto' }}>
          {learnset && learnset.length > 0 ? (
            <table className="learnset-table">
              <thead>
                <tr>
                  <th className="center col-level">Level</th>
                  <th>Move</th>
                  <th className="center col-type">Type</th>
                  <th className="center col-cat">Cat.</th>
                  <th className="center col-power">Power</th>
                  <th className="center col-acc">Acc.</th>
                  <th className="center col-pp">PP</th>
                </tr>
              </thead>
              <tbody>
                {learnset.map((learnData: any, i: number) => {
                  const move = learnData.move;
                  const moveName = move.name || formatReadableName(move);
                  const moveKey = move?.key ?? (typeof move === 'string' ? move : null);
                  const moveType = move.type ?? '';

                  return (
                    <tr key={i}>
                      <td className="center">{learnData.lvl === 0 ? 'Evo' : learnData.lvl}</td>
                      <td>
                        {moveKey ? (
                          <Link to={`/moves/${moveKey}`} className="learnset-link">
                            {moveName}
                          </Link>
                        ) : (
                          moveName
                        )}
                      </td>
                      <td className="center">{moveType ? <TypeBadge type={moveType} /> : '—'}</td>
                      <td className="center"><CategoryBadge raw={move.category || move.split} /></td>
                      <td className="center">{formatNumber(move.power)}</td>
                      <td className="center">{move.accuracy ? `${move.accuracy}%` : '—'}</td>
                      <td className="center">{formatNumber(move.pp)}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          ) : (
            <p className="empty-state">No level-up moves parsed.</p>
          )}
        </div>
      )}
    </div>
  );
}
