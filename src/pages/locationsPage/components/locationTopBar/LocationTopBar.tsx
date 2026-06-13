import type { MapNavEntry } from '../../locationUtils';
import './styles.scss';

interface Props {
  title: string;
  maps: MapNavEntry[];
  activeMapId: string;
  activeSectionId: string;
  scrollToTop: () => void;
  scrollToMap: (mapId: string) => void;
  scrollToSection: (sectionId: string) => void;
}

export default function LocationTopBar({
  title,
  maps,
  activeMapId,
  activeSectionId,
  scrollToTop,
  scrollToMap,
  scrollToSection,
}: Props) {
  return (
    <div className="loc-topbar">
      <span className="loc-topbar__title" onClick={scrollToTop}>
        {title}
      </span>

      <nav className="loc-topbar__nav">
        {maps.map(({ mapId, label, sections }) => {
          const isActive = activeMapId === mapId;
          return (
            <div key={mapId} className="loc-nav-group">
              <button
                className={`loc-nav-pill ${isActive ? 'loc-nav-pill--active' : ''}`}
                onClick={() => scrollToMap(mapId)}
              >
                {label}
              </button>

              {sections.length > 0 && (
                <div className={`loc-subsections ${isActive ? 'loc-subsections--open' : ''}`}>
                  <div className="loc-subsections__inner">
                    {sections.map(({ sectionId, label: sLabel }) => (
                      <button
                        key={sectionId}
                        className={`loc-section-pill ${isActive && activeSectionId === sectionId ? 'loc-section-pill--active' : ''}`}
                        onClick={() => scrollToSection(sectionId)}
                      >
                        {sLabel}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </nav>

      <button className="loc-back-to-top" onClick={scrollToTop} title="Back to top">
        ↑ Top
      </button>
    </div>
  );
}
