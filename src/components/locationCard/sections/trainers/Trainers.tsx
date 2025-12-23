import { useEffect, useState } from 'react';
import PartyCard from './components/partyCard/PartyCard';
import CollapseToggle from '../../../elements/collapseToggle/CollapseToggle';
import './styles.scss';
import type { ParsedTrainer } from '../../../../services/parsers/v2/trainers/types';

type Props = {
  trainers: ParsedTrainer[];
  expandAll?: boolean;
  parentOpen?: boolean;
};

export default function Trainers({ trainers, expandAll = true, parentOpen = true }: Props) {
  const [open, setOpen] = useState(true);

  useEffect(() => {
    if (expandAll || parentOpen) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setOpen(true);
    }
  }, [expandAll, parentOpen]);

  return (
    <div className="trainers-section container-style">
      <div className="section-header" onClick={() => setOpen(!open)}>
        <CollapseToggle isOpen={open} />
        <span>Trainers ({trainers.length})</span>
      </div>

      {open && (
        <div className="trainers-list">
          {trainers.map((trainer, i) => (
            <PartyCard key={i} trainer={trainer} />
          ))}
        </div>
      )}
    </div>
  );
}
