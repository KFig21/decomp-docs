import { useEffect, useState } from 'react';
import './../../styles.scss';
import Trainers from '../trainers/Trainers';
import ItemsSection from '../items/Items';
import CollapseToggle from '../../../elements/collapseToggle/CollapseToggle';
import type { LocationMap } from '../../../../services/parsers/v2/locations/types';
import EncounterTable from '../encounters/EncounterTables';

type Props = {
  location: LocationMap;
  expandAll?: boolean;
};

export default function MapCard({ location, expandAll = true }: Props) {
  const [open, setOpen] = useState(true);

  // Sync local state with parent expand/collapse
  useEffect(() => {
    setOpen(expandAll);
  }, [expandAll]);

  return (
    <div className="location-card">
      <div className="location-card-header" onClick={() => setOpen(!open)}>
        <CollapseToggle isOpen={open} />
        <span className="title">{location.name}</span>
      </div>

      {open && (
        <div className="content">
          {location.trainers && location.trainers.length > 0 && (
            <Trainers trainers={location.trainers} expandAll={expandAll} parentOpen={open} />
          )}
          {location.wildPokemon && location.wildPokemon.length > 0 && (
            <EncounterTable
              encounterTable={location.wildPokemon}
              expandAll={expandAll}
              parentOpen={open}
            />
          )}
          {location.items && location.items.length > 0 && (
            <ItemsSection items={location.items} expandAll={expandAll} parentOpen={open} />
          )}
        </div>
      )}
    </div>
  );
}
