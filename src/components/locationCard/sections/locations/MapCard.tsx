import { useEffect, useState } from 'react';
import './../../styles.scss';
import Trainers from '../trainers/Trainers';
import ItemsSection from '../items/Items';
import CollapseToggle from '../../../elements/collapseToggle/CollapseToggle';
import type { LocationMap } from '../../../../services/parsers/v2/locations/types';
import EncounterTable from '../encounters/EncounterTables';
import { formatReadableName } from '../../../../utils/functions';
import Map from './map/Map';

type Props = {
  location: LocationMap;
  expandAll?: boolean;
  isOverworld?: boolean;
};

export default function MapCard({ location, expandAll = true, isOverworld = false }: Props) {
  const [open, setOpen] = useState(true);

  // Sync local state with parent expand/collapse
  useEffect(() => {
    setOpen(expandAll);
  }, [expandAll]);

  return (
    <div className="map-card container-style">
      <div className="section-header" onClick={() => setOpen(!open)}>
        <CollapseToggle isOpen={open} />
        <span className="title">
          {isOverworld ? 'Overworld' : formatReadableName(location.name)}
        </span>
      </div>

      {open && (
        <div className="content">
          {location.mapImage && <Map location={location} expandAll={expandAll} parentOpen={open} />}
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
