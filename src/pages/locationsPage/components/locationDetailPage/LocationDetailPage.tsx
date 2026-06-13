import { useState, useEffect, useRef, useMemo } from 'react';
import type { LocationRoot } from '../../../../services/parsers/v2/locations/types';
import LocationCard from '../locationCard/sections/locations/LocationCard';
import LocationTopBar from '../locationTopBar/LocationTopBar';
import LocationHeaderCard from '../locationHeaderCard/LocationHeaderCard';
import { formatReadableName } from '../../../../utils/functions';
import {
  sanitizeMapId,
  sectionId,
  SECTION_LABELS,
  type MapNavEntry,
  type SectionKey,
  type SectionNavEntry,
} from '../../locationUtils';
import './styles.scss';

const TOPBAR_HEIGHT = 52;

type Stats = {
  mapCount: number;
  trainerCount: number;
  itemCount: number;
  encounterCount: number;
};

type Props = {
  location: LocationRoot;
  stats: Stats;
};

export default function LocationDetailPage({ location, stats }: Props) {
  const paneRef = useRef<HTMLDivElement>(null);
  const [activeMapId, setActiveMapId] = useState('');
  const [activeSectionId, setActiveSectionId] = useState('');

  const getArea = () =>
    paneRef.current?.closest('.locations-detail-area') as HTMLElement | null;

  const scrollToTop = () => {
    getArea()?.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Compute nav data — mirrors MapCard's render conditions exactly
  const navMaps: MapNavEntry[] = useMemo(() => {
    return Object.values(location.maps)
      .map((map): MapNavEntry | null => {
        const isOverworld = map.name === location.root;
        const hasContent =
          map.trainers.length > 0 ||
          map.wildPokemon.length > 0 ||
          map.items.length > 0 ||
          (map.staticEncounters?.length ?? 0) > 0 ||
          (isOverworld && !!map.mapImage);

        if (!hasContent) return null;

        const mId = sanitizeMapId(map.name);
        const hasEncounters =
          (map.wildPokemon?.length ?? 0) > 0 || (map.staticEncounters?.length ?? 0) > 0;

        const sections: SectionNavEntry[] = [];
        if (map.mapImage) {
          sections.push({ key: 'map' as SectionKey, sectionId: sectionId(mId, 'map'), label: SECTION_LABELS.map });
        }
        if (map.trainers.length > 0) {
          sections.push({ key: 'trainers' as SectionKey, sectionId: sectionId(mId, 'trainers'), label: SECTION_LABELS.trainers });
        }
        if (hasEncounters) {
          sections.push({ key: 'encounters' as SectionKey, sectionId: sectionId(mId, 'encounters'), label: SECTION_LABELS.encounters });
        }
        if (map.items.length > 0) {
          sections.push({ key: 'items' as SectionKey, sectionId: sectionId(mId, 'items'), label: SECTION_LABELS.items });
        }
        if (map.hasMart) {
          sections.push({ key: 'mart' as SectionKey, sectionId: sectionId(mId, 'mart'), label: SECTION_LABELS.mart });
        }

        return {
          mapId: mId,
          label: isOverworld ? 'Overworld' : formatReadableName(map.name),
          sections,
        };
      })
      .filter((m): m is MapNavEntry => m !== null);
  }, [location]);

  // Reset on location change
  useEffect(() => {
    setActiveMapId(navMaps[0]?.mapId ?? '');
    setActiveSectionId('');
  }, [location.root]); // eslint-disable-line react-hooks/exhaustive-deps

  // Scroll tracking
  useEffect(() => {
    const area = getArea();
    if (!area || navMaps.length === 0) return;

    const handleScroll = () => {
      const areaRect = area.getBoundingClientRect();
      const threshold = TOPBAR_HEIGHT + 8;

      // Find active map
      let currentMapId = navMaps[0].mapId;
      for (const { mapId } of navMaps) {
        const el = document.getElementById(mapId);
        if (!el) continue;
        if (el.getBoundingClientRect().top - areaRect.top <= threshold) {
          currentMapId = mapId;
        }
      }
      setActiveMapId(currentMapId);

      // Find active section within that map
      const activeNav = navMaps.find((m) => m.mapId === currentMapId);
      if (activeNav && activeNav.sections.length > 0) {
        let currentSectionId = activeNav.sections[0].sectionId;
        for (const { sectionId: sid } of activeNav.sections) {
          const el = document.getElementById(sid);
          if (!el) continue;
          if (el.getBoundingClientRect().top - areaRect.top <= threshold) {
            currentSectionId = sid;
          }
        }
        setActiveSectionId(currentSectionId);
      } else {
        setActiveSectionId('');
      }
    };

    area.addEventListener('scroll', handleScroll, { passive: true });
    return () => area.removeEventListener('scroll', handleScroll);
  }, [location.root, navMaps]);

  const scrollToMap = (mapId: string) => {
    const area = getArea();
    const el = document.getElementById(mapId);
    if (!area || !el) return;
    const offset = el.getBoundingClientRect().top - area.getBoundingClientRect().top - TOPBAR_HEIGHT;
    area.scrollBy({ top: offset, behavior: 'smooth' });
  };

  const scrollToSection = (sid: string) => {
    const area = getArea();
    const el = document.getElementById(sid);
    if (!area || !el) return;
    const offset = el.getBoundingClientRect().top - area.getBoundingClientRect().top - TOPBAR_HEIGHT;
    area.scrollBy({ top: offset, behavior: 'smooth' });
  };

  return (
    <>
      <LocationTopBar
        title={formatReadableName(location.root)}
        maps={navMaps}
        activeMapId={activeMapId}
        activeSectionId={activeSectionId}
        scrollToTop={scrollToTop}
        scrollToMap={scrollToMap}
        scrollToSection={scrollToSection}
      />

      <div className="locations-detail-pane" ref={paneRef}>
        <LocationHeaderCard locationRoot={location.root} stats={stats} />
        <LocationCard locationRoot={location} />
      </div>
    </>
  );
}
