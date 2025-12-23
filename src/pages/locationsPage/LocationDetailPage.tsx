import { useParams } from 'react-router-dom';
import type { LocationRoot } from '../../services/parsers/v2/locations/types';

type Props = {
  locations: LocationRoot[];
};

export default function LocationDetailPage({ locations }: Props) {
  const { id } = useParams();
  const loc = locations.find((loc) => loc.root === id) || { maps: {} };
  return (
    <div>
      <div>Location Detail: {id}</div>
      <div>
        {Object.values(loc.maps).map((map, index) => (
          <div key={index}>
            <h3>Map: {map.name}</h3>
            <p>Details about the map would go here.</p>
          </div>
        ))}
      </div>
    </div>
  );
}
