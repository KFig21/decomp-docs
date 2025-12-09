import { useEffect, useState } from 'react';
import type { Trainer } from '../../../../types/decomp';
import TrainerCard from './components/TrainerCard';
import CollapseToggle from '../../../elements/collapseToggle/CollapseToggle';

type Props = {
  trainers: Trainer[];
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
    <div className="section">
      <div className="section-header" onClick={() => setOpen(!open)}>
        <CollapseToggle isOpen={open} />
        <span>Trainers ({trainers.length})</span>
      </div>

      {open && (
        <div className="section-body">
          {trainers.map((trainer, i) => (
            <TrainerCard key={i} trainer={trainer} />
          ))}
        </div>
      )}
    </div>
  );
}
