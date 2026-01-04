import { useEffect, useState } from 'react';
import './../../../styles.scss';
import type { LocationMap } from '../../../../../../../services/parsers/v2/locations/types';
import CollapseToggle from '../../../../../../../components/elements/collapseToggle/CollapseToggle';

type Props = {
  location: LocationMap;
  expandAll?: boolean;
  parentOpen?: boolean;
};

export default function Map({ location, expandAll = true, parentOpen = true }: Props) {
  const [open, setOpen] = useState(true);
  const [showModal, setShowModal] = useState(false);

  const mapImageSrc = location.mapImage
    ? location.mapImage.startsWith('data:')
      ? location.mapImage
      : `data:image/png;base64,${location.mapImage}`
    : '';

  useEffect(() => {
    if (expandAll || parentOpen) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setOpen(true);
    }
  }, [expandAll, parentOpen]);

  // Close modal on ESC
  useEffect(() => {
    if (!showModal) return;

    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setShowModal(false);
    };

    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [showModal]);

  return (
    <>
      <div className="map-card container-style">
        <div className="section-header" onClick={() => setOpen(!open)}>
          <CollapseToggle isOpen={open} />
          <span className="title">Map</span>
        </div>

        {open && (
          <div className="content">
            {mapImageSrc && (
              <div className="map-container">
                <img
                  src={mapImageSrc}
                  alt={`Map of ${location.name}`}
                  className="generated-map clickable"
                  onClick={() => setShowModal(true)}
                />
              </div>
            )}
          </div>
        )}
      </div>

      {/* Modal */}
      {showModal && (
        <div className="map-modal-backdrop" onClick={() => setShowModal(false)}>
          <div className="map-modal-content" onClick={() => setShowModal(false)}>
            <img src={mapImageSrc} alt={`Map of ${location.name}`} className="map-modal-image" />
          </div>
        </div>
      )}
    </>
  );
}
