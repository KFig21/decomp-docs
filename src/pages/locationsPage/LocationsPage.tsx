import type { Location } from '../../types/decomp';
import LocationCard from '../../components/locationCard/LocationCard';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './styles.scss';
import CollapseToggle from '../../components/elements/collapseToggle/CollapseToggle';
import UploadIcon from '../../components/elements/uploadIcon/UploadIcon';

type Props = { locations: Location[]; projectName?: string };

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
        {locations.map((loc) => (
          <LocationCard key={loc.id} location={loc} expandAll={expandAll} />
        ))}
      </div>
    </div>
  );
}
