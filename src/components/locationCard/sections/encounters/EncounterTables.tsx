import { useEffect, useState } from 'react';
import CollapseToggle from '../../../elements/collapseToggle/CollapseToggle';
import type { WildEncounterTable } from '../../../../services/parsers/v2/locations/types';
import Encounters from './Encounters';

type Props = {
  encounterTable: WildEncounterTable[];
  expandAll?: boolean;
  parentOpen?: boolean;
};

export default function EncounterTable({
  encounterTable,
  expandAll = true,
  parentOpen = true,
}: Props) {
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
        <span>Encounters</span>
      </div>

      {open && encounterTable.length > 0 && (
        <div className="encounters-table">
          {encounterTable.map((table, i) => {
            return <Encounters key={i} table={table} expandAll={expandAll} parentOpen={open} />;
          })}
        </div>
      )}
    </div>
  );
}
