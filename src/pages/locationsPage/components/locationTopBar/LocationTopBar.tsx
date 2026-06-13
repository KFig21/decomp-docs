import { useEffect, useRef } from 'react';
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
  const navRef = useRef<HTMLElement>(null);
  const groupRefs = useRef<Record<string, HTMLDivElement | null>>({});

  // Auto-scroll the nav horizontally to keep the active group visible
  useEffect(() => {
    const nav = navRef.current;
    const group = groupRefs.current[activeMapId];
    if (!nav || !group) return;

    const navRect = nav.getBoundingClientRect();
    const groupRect = group.getBoundingClientRect();

    const overflowRight = groupRect.right - navRect.right;
    const overflowLeft = navRect.left - groupRect.left;

    if (overflowRight > 0) {
      nav.scrollBy({ left: overflowRight + 8, behavior: 'smooth' });
    } else if (overflowLeft > 0) {
      nav.scrollBy({ left: -(overflowLeft + 8), behavior: 'smooth' });
    }
  }, [activeMapId]);

  return (
    <div className="loc-topbar">
      <span className="loc-topbar__title" onClick={scrollToTop}>
        {title}
      </span>

      <nav className="loc-topbar__nav" ref={navRef}>
        {maps.map(({ mapId, label, sections }) => {
          const isActive = activeMapId === mapId;
          return (
            <div
              key={mapId}
              className="loc-nav-group"
              ref={(el) => { groupRefs.current[mapId] = el; }}
            >
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
