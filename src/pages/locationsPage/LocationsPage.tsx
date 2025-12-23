import LocationCard from '../../components/locationCard/sections/locations/LocationCard';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './styles.scss';
import CollapseToggle from '../../components/elements/collapseToggle/CollapseToggle';
import UploadIcon from '../../components/elements/uploadIcon/UploadIcon';
import type { LocationRoot } from '../../services/parsers/v2/locations/types';

type Props = {
  locations: LocationRoot[];
  projectName?: string;
};

export default function LocationsPage({ locations, projectName = 'Locations' }: Props) {
  const [expandAll, setExpandAll] = useState(true);
  const navigate = useNavigate();

  return (
    <div className="locations-page">
      <div className="header">
        {/* Left: Collapse / Expand */}
        <div className="collapse-all-button" onClick={() => setExpandAll(!expandAll)}>
          <CollapseToggle isOpen={expandAll} />
          <span className="collapse-all-text">{expandAll ? 'Collapse All' : 'Expand All'}</span>
        </div>

        {/* Center: Title */}
        <span className="title">{projectName}</span>

        {/* Right: Back to Upload */}
        <div className="back-button" onClick={() => navigate('/')}>
          <UploadIcon />
          Upload
        </div>
      </div>

      <div className="locations-page-content">
        {Object.values(locations).map((location) => (
          <LocationCard key={location.root} locationRoot={location} expandAll={expandAll} />
        ))}
      </div>
    </div>
  );
}
