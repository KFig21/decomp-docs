import LocationCard from '../../components/locationCard/sections/locations/LocationCard';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './styles.scss';
import UploadIcon from '../../components/elements/uploadIcon/UploadIcon';
import type { LocationRoot } from '../../services/parsers/v2/locations/types';
import LocationsSidebar from '../../components/sidebar/LocationsSidebar';

type Props = {
  locations: LocationRoot[];
  projectName?: string;
};

export default function LocationsPage({ locations, projectName = 'Locations' }: Props) {
  const [expandAll, setExpandAll] = useState(true);
  const navigate = useNavigate();

  return (
    <div className="locations-page">
      {/* Header */}
      <div className="header">
        {/* Left: Title */}
        <div className="title-container">
          <span className="title">{projectName}</span>
        </div>

        {/* Center: page navigation */}
        <div className="nav">
          <div className="nav-item-container">Locations</div>
          <div className="nav-item-container">Pokemon</div>
          <div className="nav-item-container">Items</div>
          <div className="back-button" onClick={() => navigate('/')}>
            <UploadIcon />
            Upload
          </div>
        </div>

        {/* Right: Themes */}
        <div className="themes-container">
          <div className="theme-dropdown">Themes</div>
        </div>
      </div>

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
