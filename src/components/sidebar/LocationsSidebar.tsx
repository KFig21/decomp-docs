import { useEffect, useState } from 'react';
import { formatReadableName } from '../../utils/functions';
import { toSafeId } from '../../utils/dom';
import type { LocationRoot } from '../../services/parsers/v2/locations/types';
import './styles.scss';

type Props = {
  locations: LocationRoot[];
};

export default function LocationsSidebar({ locations }: Props) {
  const [activeId, setActiveId] = useState<string | null>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setActiveId(entry.target.id);
          }
        });
      },
      {
        rootMargin: '-30% 0px -60% 0px',
        threshold: 0,
      },
    );

    Object.values(locations).forEach((loc) => {
      const el = document.getElementById(toSafeId(loc.root));
      if (el) observer.observe(el);
    });

    return () => observer.disconnect();
  }, [locations]);

  return (
    <aside className="locations-sidebar">
      {Object.values(locations).map((loc) => {
        const id = toSafeId(loc.root);
        const isActive = activeId === id;

        return (
          <a key={id} href={`#${id}`} className={`sidebar-item ${isActive ? 'active' : ''}`}>
            <span>{formatReadableName(loc.root)}</span>
          </a>
        );
      })}
    </aside>
  );
}
