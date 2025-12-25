import { useEffect, useState } from 'react';
import './../../styles.scss';
import CollapseToggle from '../../../elements/collapseToggle/CollapseToggle';
import type { LocationMap, LocationRoot } from '../../../../services/parsers/v2/locations/types';
import MapCard from './MapCard';
import { formatReadableName } from '../../../../utils/functions.ts';
import { toSafeId } from '../../../../utils/dom.ts';

type Props = {
  locationRoot: LocationRoot;
  expandAll?: boolean;
};

export default function LocationCard({ locationRoot, expandAll = true }: Props) {
  const [open, setOpen] = useState(true);

  // Sync local state with parent expand/collapse
  useEffect(() => {
    setOpen(expandAll);
  }, [expandAll]);

  return (
    <div className="location-card container-style" id={toSafeId(locationRoot.root)}>
      <div className="section-header" onClick={() => setOpen(!open)}>
        <CollapseToggle isOpen={open} />
        <span className="title">{formatReadableName(locationRoot.root)}</span>
      </div>

      {open && (
        <div>
          {Object.values(locationRoot.maps).map((locationMap: LocationMap, i: number) => {
            const hasContent =
              locationMap.trainers.length > 0 ||
              locationMap.wildPokemon.length > 0 ||
              locationMap.items.length > 0;
            const isOverworld = locationMap.name === locationRoot.root;
            return (
              hasContent && (
                <div key={i} className="map-section content">
                  <MapCard location={locationMap} expandAll={expandAll} isOverworld={isOverworld} />
                </div>
              )
            );
          })}
        </div>
      )}
    </div>
  );
}
