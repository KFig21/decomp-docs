/* eslint-disable @typescript-eslint/no-explicit-any */
import { useState } from 'react';
import CollapseToggle from '../../../../components/elements/collapseToggle/CollapseToggle';
import { formatReadableName } from '../../../../utils/functions';

type Props = {
  learnset: any[];
};

export default function Learnset({ learnset }: Props) {
  const [isOpen, setIsOpen] = useState(true);

  return (
    <div className="section pokemon-card-style">
      <div className="section-header" onClick={() => setIsOpen(!isOpen)}>
        <CollapseToggle isOpen={isOpen} />
        <span>Level Up Moves</span>
      </div>
      {isOpen && (
        <div className="table-container content">
          {learnset && learnset.length > 0 ? (
            <table className="data-table">
              <thead>
                <tr>
                  <th className="center">Level</th>
                  <th className="left">Move</th>
                </tr>
              </thead>
              <tbody>
                {learnset.map((learnData: any, i: number) => (
                  <tr key={i}>
                    <td className="center">{learnData.lvl === 0 ? 'Evo' : learnData.lvl}</td>
                    <td>{learnData.move.name || formatReadableName(learnData.move)}</td>
                  </tr>
                ))}
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
