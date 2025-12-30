import { useEffect, useState } from 'react';
import './../../../styles.scss';
import type { LocationMap } from '../../../../../services/parsers/v2/locations/types';
import CollapseToggle from '../../../../elements/collapseToggle/CollapseToggle';

type Props = {
  location: LocationMap;
  expandAll?: boolean;
  parentOpen?: boolean;
};

export default function Map({ location, expandAll = true, parentOpen = true }: Props) {
  const [open, setOpen] = useState(true);

  useEffect(() => {
    if (expandAll || parentOpen) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setOpen(true);
    }
  }, [expandAll, parentOpen]);

  return (
    <div className="map-card container-style">
      <div className="section-header" onClick={() => setOpen(!open)}>
        <CollapseToggle isOpen={open} />
        <span className="title">Map</span>
      </div>

      {open && (
        <div className="content">
          {location.mapImage && (
            <div className="map-container">
              <img
                src={location.mapImage}
                alt={`Map of ${location.name}`}
                className="generated-map"
              />
            </div>
          )}
        </div>
      )}
    </div>
  );
}
