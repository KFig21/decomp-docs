import { useParams } from 'react-router-dom';
import { useData } from '../../../../contexts/dataContext';
import type { LocationMap } from '../../../../services/parsers/v2/locations/types';
import './styles.scss';

export default function LocationDetailPage() {
  const { id } = useParams<{ id: string }>();
  const { locations } = useData();

  const loc = locations[id ?? ''];

  if (!loc?.maps) {
    return <div className="locations-detail-pane">Location not found!</div>;
  }

  return (
    <div className="locations-detail-pane">
      <div>
        {(Object.values(loc.maps) as LocationMap[]).map((map, index) => (
          <div key={index} className="map-detail">
            <h3>Map: {map.name}</h3>
            <p>Details about the map would go here.</p>
          </div>
        ))}
      </div>
    </div>
  );
}
