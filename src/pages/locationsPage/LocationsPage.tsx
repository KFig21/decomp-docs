import { useEffect, useState, useMemo, type Dispatch, type SetStateAction } from 'react';
import './styles.scss';
import { useData } from '../../contexts/dataContext';
import LocationsSidebar from './components/sidebar/LocationsSidebar';
import LocationCard from './components/locationCard/sections/locations/LocationCard';
import type { LocationRoot } from '../../services/parsers/v2/locations/types';
import { TrainerTabProvider } from '../../contexts/trainerTabContext';

type Props = {
  setCurrentPage: Dispatch<SetStateAction<string>>;
};

export default function LocationsPage({ setCurrentPage }: Props) {
  const { locations } = useData();
  const [expandAll, setExpandAll] = useState(true);

  useEffect(() => {
    setCurrentPage('locations');
  }, [setCurrentPage]);

  // Safely extract and sort the locations to match the sidebar order
  const sortedLocations = useMemo(() => {
    if (!locations) return [];

    const locationsArray = (
      Array.isArray(locations) ? locations : Object.values(locations)
    ) as LocationRoot[];

    // FILTER: Only keep locations that have at least one map with actual content
    const filteredAndSorted = locationsArray
      .filter((root) => {
        return Object.values(root.maps).some((map) => {
          const isOverworld = map.name === root.root;
          return (
            map.trainers.length > 0 ||
            map.wildPokemon.length > 0 ||
            map.items.length > 0 ||
            (map.staticEncounters && map.staticEncounters.length > 0) ||
            (isOverworld && !!map.mapImage)
          );
        });
      })
      .sort((a, b) => (a.order ?? 9999) - (b.order ?? 9999));

    return filteredAndSorted;
  }, [locations]);

  if (!sortedLocations || sortedLocations.length === 0) {
    return <div className="locations-page">No locations loaded yet.</div>;
  }

  return (
    <TrainerTabProvider>
      <div className="locations-page">
        <div className="page-content">
          <LocationsSidebar
            locations={sortedLocations}
            expandAll={expandAll}
            setExpandAll={setExpandAll}
          />

          <div className="locations-page-content">
            {sortedLocations.map((location) => (
              <LocationCard key={location.root} locationRoot={location} expandAll={expandAll} />
            ))}
          </div>
        </div>
      </div>
    </TrainerTabProvider>
  );
}
