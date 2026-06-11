import { useEffect } from 'react';

type Props = {
  src: string;
  alt: string;
  onClose: () => void;
};

export default function MapModal({ src, alt, onClose }: Props) {
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [onClose]);

  return (
    <div className="map-modal-backdrop" onClick={onClose}>
      <button className="map-modal-close" onClick={onClose} aria-label="Close map">
        ×
      </button>
      <div className="map-modal-content">
        <img src={src} alt={alt} className="map-modal-image" />
      </div>
    </div>
  );
}
