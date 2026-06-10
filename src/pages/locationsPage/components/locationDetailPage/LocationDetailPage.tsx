import type { LocationRoot } from '../../../../services/parsers/v2/locations/types';
import LocationCard from '../locationCard/sections/locations/LocationCard';
import { formatReadableName } from '../../../../utils/functions';
import './styles.scss';

type Stats = {
  mapCount: number;
  trainerCount: number;
  itemCount: number;
  encounterCount: number;
};

type Props = {
  location: LocationRoot;
  stats: Stats;
  scrollToTop: () => void;
};

export default function LocationDetailPage({ location, stats, scrollToTop }: Props) {
  return (
    <>
      {/* ── Sticky detail header ── */}
      <div className="locations-detail-header">
        <h2 className="locations-detail-header__title">
          {formatReadableName(location.root)}
        </h2>
        <div className="locations-detail-header__stats">
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
        <button className="loc-back-to-top" onClick={scrollToTop} title="Back to top">
          ↑ Top
        </button>
      </div>

      {/* ── Location content ── */}
      <div className="locations-detail-pane">
        <LocationCard locationRoot={location} />
      </div>
    </>
  );
}
