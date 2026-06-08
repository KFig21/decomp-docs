import { useNavigate } from 'react-router-dom';
import type { LocationRoot } from '../../../../services/parsers/v2/locations/types';
import { formatReadableName } from '../../../../utils/functions';
import './styles.scss';

type Props = {
  locations: LocationRoot[];
  activeId: string | null;
};

export default function LocationsSidebar({ locations, activeId }: Props) {
  const navigate = useNavigate();

  return (
    <aside className="locations-sidebar">
      {locations.map((loc) => (
        <div
          key={loc.root}
          className={`locations-sidebar-item ${loc.root === activeId ? 'active' : ''}`}
          onClick={() => navigate(`/locations/${loc.root}`)}
        >
          <span className="location-name">{formatReadableName(loc.root)}</span>
        </div>
      ))}
    </aside>
  );
}
