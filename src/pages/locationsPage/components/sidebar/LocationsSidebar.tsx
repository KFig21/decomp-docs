import { useEffect, useState, useMemo } from 'react';
import type { LocationRoot } from '../../../../services/parsers/v2/locations/types';
import { toSafeId } from '../../../../utils/dom';
import CollapseToggle from '../../../../components/elements/collapseToggle/CollapseToggle';
import { formatReadableName } from '../../../../utils/functions';
import './styles.scss';

type Props = {
  // It's technically an object Record in your context, but this signature works if you extract values
  locations: Record<string, LocationRoot> | LocationRoot[];
  expandAll: boolean;
  setExpandAll: React.Dispatch<React.SetStateAction<boolean>>;
};

export default function LocationsSidebar({ locations, expandAll, setExpandAll }: Props) {
  const [activeId, setActiveId] = useState<string | null>(null);

  const sortedLocations = useMemo(() => {
    const locationsArray = Array.isArray(locations) ? locations : Object.values(locations);
    return [...locationsArray].sort((a, b) => (a.order ?? 9999) - (b.order ?? 9999));
  }, [locations]);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setActiveId(entry.target.id);
          }
        });
      },
      { rootMargin: '-30% 0px -60% 0px', threshold: 0 },
    );

    const locationsArray = Array.isArray(locations) ? locations : Object.values(locations);
    locationsArray.forEach((loc) => {
      const el = document.getElementById(toSafeId(loc.root));
      if (el) observer.observe(el);
    });

    return () => observer.disconnect();
  }, [locations]);

  return (
    <div className="sidebar-wrapper">
      <div className="collapse-all-button" onClick={() => setExpandAll(!expandAll)}>
        <CollapseToggle isOpen={expandAll} />
        <span className="collapse-all-text">{expandAll ? 'Collapse All' : 'Expand All'}</span>
      </div>
      <aside className="locations-sidebar">
        {sortedLocations.map((loc) => {
          const id = toSafeId(loc.root);
          const isActive = activeId === id;
          return (
            <a key={id} href={`#${id}`} className={`sidebar-item ${isActive ? 'active' : ''}`}>
              <span>{formatReadableName(loc.root)}</span>
            </a>
          );
        })}
      </aside>
    </div>
  );
}
