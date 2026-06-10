import { useMemo, useEffect, useState, useRef, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import './styles.scss';
import { useData } from '../../contexts/dataContext';
import LocationsSidebar from './components/sidebar/LocationsSidebar';
import type { LocationRoot } from '../../services/parsers/v2/locations/types';
import { TrainerTabProvider } from '../../contexts/trainerTabContext';
import { formatReadableName } from '../../utils/functions';
import LocationsFilterBar from './components/filterBar/LocationsFilterBar';
import LocationDetailPage from './components/locationDetailPage/LocationDetailPage';

// ── Types ─────────────────────────────────────────────────────────────────────

export type LocationFilters = {
  features: string[];       // 'trainers' | 'rivals' | 'gym' | 'mart' | 'wild' | 'items'
  encounterMethods: string[]; // e.g. 'Tall Grass', 'Surfing'
  weather: string[];          // e.g. 'Rain', 'Sandstorm'
  hmEvents: string[];         // e.g. 'cut', 'surf', 'waterfall'
  tmEvents: string[];         // e.g. 'rock_smash'
};

const DEFAULT_FILTERS: LocationFilters = {
  features: [],
  encounterMethods: [],
  weather: [],
  hmEvents: [],
  tmEvents: [],
};

// ── Helpers ───────────────────────────────────────────────────────────────────

function getLocationStats(location: LocationRoot) {
  let trainerCount = 0;
  let itemCount = 0;
  const encounterSpecies = new Set<string>();

  for (const map of Object.values(location.maps)) {
    trainerCount += map.trainers.length;
    itemCount += map.items.length;
    for (const table of map.wildPokemon ?? []) {
      for (const entry of table.encounters ?? []) {
        if (entry.pokemon?.key) encounterSpecies.add(entry.pokemon.key);
      }
    }
    for (const se of map.staticEncounters ?? []) {
      if (se.species?.key) encounterSpecies.add(se.species.key);
    }
  }

  return {
    mapCount: Object.keys(location.maps).length,
    trainerCount,
    itemCount,
    encounterCount: encounterSpecies.size,
  };
}

function locationMatchesFilters(loc: LocationRoot, filters: LocationFilters, search: string): boolean {
  if (search) {
    const q = search.toLowerCase();
    if (!formatReadableName(loc.root).toLowerCase().includes(q)) return false;
  }

  const maps = Object.values(loc.maps);

  for (const feat of filters.features) {
    switch (feat) {
      case 'trainers':
        if (!maps.some((m) => m.trainers.length > 0)) return false;
        break;
      case 'rivals':
        if (!loc.hasRival) return false;
        break;
      case 'gym':
        if (!loc.hasGym) return false;
        break;
      case 'mart':
        if (!maps.some((m) => m.hasMart)) return false;
        break;
      case 'wild':
        if (
          !maps.some(
            (m) =>
              (m.wildPokemon && m.wildPokemon.length > 0) ||
              (m.staticEncounters && m.staticEncounters.length > 0),
          )
        )
          return false;
        break;
      case 'items':
        if (!maps.some((m) => m.items.length > 0)) return false;
        break;
    }
  }

  for (const method of filters.encounterMethods) {
    if (!maps.some((m) => m.wildPokemon?.some((t) => t.method === method))) return false;
  }

  for (const w of filters.weather) {
    if (!maps.some((m) => m.weathers?.some((pw) => pw.name === w))) return false;
  }

  for (const hm of filters.hmEvents) {
    if (!maps.some((m) => m.hmEvents?.includes(hm))) return false;
  }

  for (const tm of filters.tmEvents) {
    if (!maps.some((m) => m.hmEvents?.includes(tm))) return false;
  }

  return true;
}

// ── Component ─────────────────────────────────────────────────────────────────

export default function LocationsPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { locations } = useData();

  const [searchTerm, setSearchTerm] = useState('');
  const [filters, setFilters] = useState<LocationFilters>(DEFAULT_FILTERS);
  const detailAreaRef = useRef<HTMLDivElement>(null);

  const scrollToTop = useCallback(() => {
    detailAreaRef.current?.scrollTo({ top: 0, behavior: 'smooth' });
  }, []);

  const sortedLocations = useMemo(() => {
    if (!locations) return [];

    const locationsArray = (
      Array.isArray(locations) ? locations : Object.values(locations)
    ) as LocationRoot[];

    return locationsArray
      .filter((root) =>
        Object.values(root.maps).some((map) => {
          const isOverworld = map.name === root.root;
          return (
            map.trainers.length > 0 ||
            map.wildPokemon.length > 0 ||
            map.items.length > 0 ||
            (map.staticEncounters && map.staticEncounters.length > 0) ||
            (isOverworld && !!map.mapImage)
          );
        }),
      )
      .sort((a, b) => (a.order ?? 9999) - (b.order ?? 9999));
  }, [locations]);

  // Collect unique encounter methods and weather values for dropdown options
  const encounterMethodOptions = useMemo(() => {
    const methods = new Set<string>();
    for (const loc of sortedLocations) {
      for (const map of Object.values(loc.maps)) {
        for (const table of map.wildPokemon ?? []) {
          if (table.method) methods.add(table.method);
        }
      }
    }
    return Array.from(methods).sort();
  }, [sortedLocations]);

  const weatherOptions = useMemo(() => {
    const weathers = new Set<string>();
    for (const loc of sortedLocations) {
      for (const map of Object.values(loc.maps)) {
        for (const w of map.weathers ?? []) weathers.add(w.name);
      }
    }
    return Array.from(weathers).sort();
  }, [sortedLocations]);

  const filteredLocations = useMemo(
    () => sortedLocations.filter((loc) => locationMatchesFilters(loc, filters, searchTerm)),
    [sortedLocations, filters, searchTerm],
  );

  const removeFilter = (cat: keyof LocationFilters, value: string) => {
    setFilters((prev) => ({
      ...prev,
      [cat]: (prev[cat] as string[]).filter((v) => v !== value),
    }));
  };

  const clearAll = () => {
    setSearchTerm('');
    setFilters(DEFAULT_FILTERS);
  };

  // Scroll detail pane to top whenever the selected location changes
  useEffect(() => {
    detailAreaRef.current?.scrollTo({ top: 0, behavior: 'instant' as ScrollBehavior });
  }, [id]);

  // Auto-navigate to first location when no id is selected
  useEffect(() => {
    if (!id && filteredLocations.length > 0) {
      navigate(`/locations/${filteredLocations[0].root}`, { replace: true });
    }
  }, [id, filteredLocations, navigate]);

  const activeLocation = useMemo(
    () => sortedLocations.find((l) => l.root === id) ?? null,
    [sortedLocations, id],
  );

  const activeStats = useMemo(
    () => (activeLocation ? getLocationStats(activeLocation) : null),
    [activeLocation],
  );

  if (!sortedLocations || sortedLocations.length === 0) {
    return <div className="locations-page">No locations loaded yet.</div>;
  }

  return (
    <TrainerTabProvider>
      <div className="locations-page">
        <LocationsFilterBar
          searchTerm={searchTerm}
          setSearchTerm={setSearchTerm}
          filters={filters}
          setFilters={setFilters}
          removeFilter={removeFilter}
          clearAll={clearAll}
          encounterMethodOptions={encounterMethodOptions}
          weatherOptions={weatherOptions}
        />

        <div className="locations-page-content">
          <LocationsSidebar locations={filteredLocations} activeId={id ?? null} />

          <div className="locations-detail-area" ref={detailAreaRef}>
            {activeLocation && activeStats && (
              <LocationDetailPage
                location={activeLocation}
                stats={activeStats}
                scrollToTop={scrollToTop}
              />
            )}
          </div>
        </div>
      </div>
    </TrainerTabProvider>
  );
}
