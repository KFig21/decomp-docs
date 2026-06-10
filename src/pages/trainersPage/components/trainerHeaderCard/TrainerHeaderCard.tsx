/* eslint-disable @typescript-eslint/no-explicit-any */
import { Link } from 'react-router-dom';
import TrainerSprite from '../../../../components/elements/sprites/TrainerSprite';
import { formatReadableName } from '../../../../utils/functions';
import './styles.scss';

type Props = {
  trainer: any;
  battleCount?: number;
};

export default function TrainerHeaderCard({ trainer, battleCount }: Props) {
  const { name, trainerClass, trainerPic, doubleBattle, location } = trainer;

  const locationName = location?.locationKey ? formatReadableName(location.locationKey) : null;

  return (
    <div className="trainer-header-card trainer-card-style">
      <div className="trainer-header-sprite">
        <TrainerSprite
          name={name}
          trainerClass={trainerPic ?? trainerClass}
          sprite={trainerPic}
          size={96}
        />
      </div>

      <div className="trainer-header-info">
        <div className="trainer-header-top">
          <div className="trainer-header-name">{name}</div>
          <div className="trainer-header-badges">
            <span className="trainer-class-badge">{trainerClass}</span>
            {doubleBattle && <span className="double-battle-badge">Double Battle</span>}
          </div>
        </div>

        <div className="trainer-header-stats">
          {battleCount != null && (
            <div className="stat-block">
              <span className="stat-label">Battles</span>
              <span className="stat-value">{battleCount}</span>
            </div>
          )}
          {battleCount != null && locationName && <div className="stat-divider" />}
          {locationName && location?.locationKey && (
            <div className="stat-block stat-block--location">
              <span className="stat-label">First Encounter</span>
              <Link
                to={`/locations/${location.locationKey}`}
                className="stat-value stat-value--location stat-value--link"
              >
                {locationName}
              </Link>
            </div>
          )}
        </div>

        {/* {items && items.length > 0 && (
          <div className="trainer-header-items">
            <span className="items-label">Items:</span>
            {items.map((item: any, i: number) => (
              <div key={i} className="trainer-item-chip">
                <ItemSprite item={item} size={20} />
                <span>{item.name || item.key}</span>
              </div>
            ))}
          </div>
        )} */}
      </div>
    </div>
  );
}
