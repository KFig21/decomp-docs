// src/pages/locationsPage/LocationDetailPage.tsx
import { useParams } from 'react-router-dom';
import { useData } from '../../contexts/dataContext'; // import the context

export default function LocationDetailPage() {
  const { id } = useParams<{ id: string }>();
  const { locations } = useData(); // get locations from context

  const loc = locations.find((loc) => loc.root === id) || { maps: {} };

  if (!loc.maps) {
    return <div>Location not found!</div>;
  }

  return (
    <div className="location-detail-page">
      {/* <h1>Location Detail: {loc.root}</h1> */}
      <div>
        {Object.values(loc.maps).map((map, index) => (
          <div key={index} className="map-detail">
            <h3>Map: {map.name}</h3>
            <p>Details about the map would go here.</p>
          </div>
        ))}
      </div>
    </div>
  );
}
