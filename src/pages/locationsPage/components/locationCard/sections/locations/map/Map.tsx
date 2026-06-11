import { useState } from 'react';
import './../../../styles.scss';
import type { LocationMap } from '../../../../../../../services/parsers/v2/locations/types';
import CollapseToggle from '../../../../../../../components/elements/collapseToggle/CollapseToggle';
import MapModal from './MapModal';

type Props = {
  location: LocationMap;
};

export default function Map({ location }: Props) {
  const [isOpen, setIsOpen] = useState(true);
  const [showModal, setShowModal] = useState(false);

  if (!location.mapImage) return null;

  const mapImageSrc = location.mapImage.startsWith('data:')
    ? location.mapImage
    : `data:image/png;base64,${location.mapImage}`;

  return (
    <>
      <div className={`map-card container-style ${isOpen ? '' : 'collapsed'}`}>
        <div className="section-header" onClick={() => setIsOpen(!isOpen)}>
          <CollapseToggle isOpen={isOpen} />
          <span className="title">Map</span>
        </div>

        {isOpen && (
          <div className="content">
            <div className="map-container">
              <img
                src={mapImageSrc}
                alt={`Map of ${location.name}`}
                className="generated-map clickable"
                onClick={() => setShowModal(true)}
              />
            </div>
          </div>
        )}
      </div>

      {showModal && (
        <MapModal
          src={mapImageSrc}
          alt={`Map of ${location.name}`}
          onClose={() => setShowModal(false)}
        />
      )}
    </>
  );
}
