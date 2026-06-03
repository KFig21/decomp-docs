/* eslint-disable @typescript-eslint/no-explicit-any */
import { useState } from 'react';
import CollapseToggle from '../../../../components/elements/collapseToggle/CollapseToggle';
import { formatReadableName } from '../../../../utils/functions';
import TypeBadge from '../../../../components/elements/typeBadge/TypeBadge';
import './styles.scss';

type Props = {
  learnset: any[];
};

export default function Learnset({ learnset }: Props) {
  const [isOpen, setIsOpen] = useState(true);

  // UPDATED: Support both the old SPLIT_ and new DAMAGE_CATEGORY_ syntax
  const formatCategory = (catStr?: string) => {
    if (!catStr) return '—';
    return formatReadableName(catStr.replace('SPLIT_', '').replace('DAMAGE_CATEGORY_', ''));
  };

  const formatNumber = (num?: number) => {
    if (!num || num === 0) return '—';
    return num;
  };

  return (
    <div className="section pokemon-card-style">
      <div className="section-header" onClick={() => setIsOpen(!isOpen)}>
        <CollapseToggle isOpen={isOpen} />
        <span>Level Up Moves</span>
      </div>
      {isOpen && (
        <div className="table-container content" style={{ overflowX: 'auto' }}>
          {learnset && learnset.length > 0 ? (
            <table className="data-table">
              <thead>
                <tr>
                  <th className="center">Level</th>
                  <th className="left">Move</th>
                  <th className="center">Type</th>
                  <th className="center">Cat.</th>
                  <th className="center">Power</th>
                  <th className="center">Acc.</th>
                  <th className="center">PP</th>
                </tr>
              </thead>
              <tbody>
                {learnset.map((learnData: any, i: number) => {
                  const move = learnData.move;
                  const moveName = move.name || formatReadableName(move);
                  const moveType = move.type ? move.type.replace('type_', '') : '';

                  return (
                    <tr key={i}>
                      <td className="center">{learnData.lvl === 0 ? 'Evo' : learnData.lvl}</td>
                      <td>{moveName}</td>
                      <td className="center">{moveType ? <TypeBadge type={moveType} /> : '—'}</td>
                      <td className="center">{formatCategory(move.category || move.split)}</td>
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
