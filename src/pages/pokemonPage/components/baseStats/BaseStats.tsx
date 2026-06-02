/* eslint-disable @typescript-eslint/no-explicit-any */
import { useState } from 'react';
import CollapseToggle from '../../../../components/elements/collapseToggle/CollapseToggle';
import './styles.scss';

type Props = {
  stats: any;
  bst: number;
};

export default function BaseStats({ stats, bst }: Props) {
  const [isOpen, setIsOpen] = useState(true);

  if (!stats) return null;

  return (
    <div className="section pokemon-card-style">
      <div className="section-header" onClick={() => setIsOpen(!isOpen)}>
        <CollapseToggle isOpen={isOpen} />
        <span>Base Stats ({bst} BST)</span>
      </div>
      {isOpen && (
        <div className="stats-container content">
          {Object.entries(stats).map(([statName, value]) => {
            const percentage = Math.min((Number(value) / 255) * 100, 100);
            return (
              <div key={statName} className="stat-row">
                <div className="stat-label">{statName.toUpperCase()}</div>
                <div className="stat-value">{String(value)}</div>
                <div className="stat-bar-wrapper">
                  <div className="stat-bar" style={{ width: `${percentage}%` }}></div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
