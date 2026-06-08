import { useState } from 'react';
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
  isOverworld?: boolean;
};

export default function MapCard({ location, isOverworld = false }: Props) {
  const [isOpen, setIsOpen] = useState(true);

  const hasEncounters =
    (location.wildPokemon && location.wildPokemon.length > 0) ||
    (location.staticEncounters && location.staticEncounters.length > 0);

  return (
    <div className={`map-card container-style ${isOpen ? '' : 'collapsed'}`}>
      <div className="section-header" onClick={() => setIsOpen(!isOpen)}>
        <CollapseToggle isOpen={isOpen} />
        <span className="title">
          {isOverworld ? 'Overworld' : formatReadableName(location.name)}
        </span>
        {location.weathers && location.weathers.length > 0 && (
          <div className="map-weather-badges">
            {location.weathers.map((w) => (
              <span key={w.key} className="map-weather-badge" title={`Weather: ${w.name}`}>
                {w.icon} {w.name}
              </span>
            ))}
          </div>
        )}
      </div>

      {isOpen && (
        <div className="content">
          {location.mapImage && <Map location={location} parentOpen={isOpen} />}

          {location.trainers && location.trainers.length > 0 && (
            <Trainers trainers={location.trainers} parentOpen={isOpen} />
          )}

          {hasEncounters && (
            <EncounterTable
              encounterTable={location.wildPokemon}
              staticEncounters={location.staticEncounters}
              parentOpen={isOpen}
            />
          )}

          {location.items && location.items.length > 0 && (
            <ItemsSection items={location.items} parentOpen={isOpen} />
          )}
        </div>
      )}
    </div>
  );
}
