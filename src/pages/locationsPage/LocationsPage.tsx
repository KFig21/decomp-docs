// src/pages/locationsPage/LocationsPage.tsx
import { useEffect, useState, type Dispatch, type SetStateAction } from 'react';
import './styles.scss';
import { useData } from '../../contexts/dataContext';
import LocationsSidebar from './components/sidebar/LocationsSidebar';
import LocationCard from './components/locationCard/sections/locations/LocationCard';

type Props = {
  setCurrentPage: Dispatch<SetStateAction<string>>;
};

export default function LocationsPage({ setCurrentPage }: Props) {
  const { locations } = useData();
  const [expandAll, setExpandAll] = useState(true);

  useEffect(() => {
    setCurrentPage('locations');
  }, [setCurrentPage]);

  if (!locations || locations.length === 0) {
    return <div className="locations-page">No locations loaded yet.</div>;
  }

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
