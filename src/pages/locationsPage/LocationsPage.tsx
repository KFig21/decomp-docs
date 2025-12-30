import type { LocationRoot } from '../../services/parsers/v2/locations/types';
import { useEffect, useState, type Dispatch, type SetStateAction } from 'react';
import './styles.scss';
import LocationsSidebar from './components/sidebar/LocationsSidebar';
import LocationCard from './components/locationCard/sections/locations/LocationCard';

type Props = {
  locations: LocationRoot[];
  setCurrentPage: Dispatch<SetStateAction<string>>;
};

export default function LocationsPage({ locations, setCurrentPage }: Props) {
  const [expandAll, setExpandAll] = useState(true);

  useEffect(() => {
    setCurrentPage('locations');
  }, []);

  return (
    <div className="locations-page">
      <div className="page-content">
        {/* Sidebar */}
        <LocationsSidebar locations={locations} expandAll={expandAll} setExpandAll={setExpandAll} />

        {/* Content */}
        <div className="locations-page-content">
          {Object.values(locations).map((location) => (
            <LocationCard key={location.root} locationRoot={location} expandAll={expandAll} />
          ))}
        </div>
      </div>
    </div>
  );
}
