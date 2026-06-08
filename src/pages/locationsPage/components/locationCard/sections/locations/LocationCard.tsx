import './../../styles.scss';
import MapCard from './MapCard';
import type {
  LocationMap,
  LocationRoot,
} from '../../../../../../services/parsers/v2/locations/types';

type Props = {
  locationRoot: LocationRoot;
};

export default function LocationCard({ locationRoot }: Props) {
  return (
    <div className="location-card">
      <div className="location-maps">
        {Object.values(locationRoot.maps).map((locationMap: LocationMap, i: number) => {
          const isOverworld = locationMap.name === locationRoot.root;

          const hasContent =
            locationMap.trainers.length > 0 ||
            locationMap.wildPokemon.length > 0 ||
            locationMap.items.length > 0 ||
            (locationMap.staticEncounters && locationMap.staticEncounters.length > 0) ||
            (isOverworld && !!locationMap.mapImage);

          return hasContent && <MapCard key={i} location={locationMap} isOverworld={isOverworld} />;
        })}
      </div>
    </div>
  );
}

