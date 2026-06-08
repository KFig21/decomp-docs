// src/pages/locationsPage/components/locationCard/sections/encounters/EncounterTables.tsx
import { useEffect, useState } from 'react';
import Encounters from './Encounters';
import StaticEncounters from './StaticEncounters';
import CollapseToggle from '../../../../../../components/elements/collapseToggle/CollapseToggle';
import type {
  WildEncounterTable,
  StaticEncounter,
} from '../../../../../../services/parsers/v2/locations/types';

type Props = {
  encounterTable: WildEncounterTable[];
  staticEncounters?: StaticEncounter[];
  expandAll?: boolean;
  parentOpen?: boolean;
};

export default function EncounterTable({
  encounterTable,
  staticEncounters = [],
  expandAll = true,
  parentOpen = true,
}: Props) {
  const [isOpen, setIsOpen] = useState(true);

  useEffect(() => {
    if (expandAll || parentOpen) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setIsOpen(true);
    }
  }, [expandAll, parentOpen]);

  return (
    <div className={`section container-style ${isOpen ? '' : 'collapsed'}`}>
      <div className="section-header" onClick={() => setIsOpen(!isOpen)}>
        <CollapseToggle isOpen={isOpen} />
        <span>Encounters</span>
      </div>

      {isOpen && (
        <div className="content">
          {/* Render standard wild encounter tables (Land, Surf, etc) */}
          {encounterTable &&
            encounterTable.map((table, i) => {
              return <Encounters key={i} table={table} expandAll={expandAll} parentOpen={isOpen} />;
            })}

          {/* Render static encounters directly underneath */}
          {staticEncounters && staticEncounters.length > 0 && (
            <StaticEncounters
              encounters={staticEncounters}
              expandAll={expandAll}
              parentOpen={isOpen}
            />
          )}
        </div>
      )}
    </div>
  );
}
