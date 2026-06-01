// src/pages/locationsPage/components/locationCard/sections/locations/MapCard.tsx
import { useEffect, useState } from 'react';
import './../../styles.scss';
import Trainers from '../trainers/Trainers';
import ItemsSection from '../items/Items';
import EncounterTable from '../encounters/EncounterTables';
import Map from './map/Map';
import type { LocationMap } from '../../../../../../services/parsers/v2/locations/types';
import CollapseToggle from '../../../../../../components/elements/collapseToggle/CollapseToggle';
import { formatReadableName } from '../../../../../../utils/functions';

type Props = {
  location: LocationMap;
  expandAll?: boolean;
  isOverworld?: boolean;
};

export default function MapCard({ location, expandAll = true, isOverworld = false }: Props) {
  const [open, setOpen] = useState(true);

  useEffect(() => {
    setOpen(expandAll);
  }, [expandAll]);

  // Combine the check for any type of encounter
  const hasEncounters =
    (location.wildPokemon && location.wildPokemon.length > 0) ||
    (location.staticEncounters && location.staticEncounters.length > 0);

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

          {hasEncounters && (
            <EncounterTable
              encounterTable={location.wildPokemon}
              staticEncounters={location.staticEncounters}
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
