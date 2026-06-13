import { formatReadableName } from '../../../../utils/functions';
import './styles.scss';

type Stats = {
  mapCount: number;
  trainerCount: number;
  itemCount: number;
  encounterCount: number;
};

type Props = {
  locationRoot: string;
  stats: Stats;
};

export default function LocationHeaderCard({ locationRoot, stats }: Props) {
  return (
    <div className="location-header-card">
      <h1 className="location-header-card__title">
        {formatReadableName(locationRoot)}
      </h1>
      <div className="location-header-card__stats">
        {stats.mapCount > 1 && (
          <div className="loc-stat">
            <span className="loc-stat__value">{stats.mapCount}</span>
            <span className="loc-stat__label">Maps</span>
          </div>
        )}
        {stats.trainerCount > 0 && (
          <div className="loc-stat">
            <span className="loc-stat__value">{stats.trainerCount}</span>
            <span className="loc-stat__label">Trainers</span>
          </div>
        )}
        {stats.itemCount > 0 && (
          <div className="loc-stat">
            <span className="loc-stat__value">{stats.itemCount}</span>
            <span className="loc-stat__label">Items</span>
          </div>
        )}
        {stats.encounterCount > 0 && (
          <div className="loc-stat">
            <span className="loc-stat__value">{stats.encounterCount}</span>
            <span className="loc-stat__label">Wild Species</span>
          </div>
        )}
      </div>
    </div>
  );
}
