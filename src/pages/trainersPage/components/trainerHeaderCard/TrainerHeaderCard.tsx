/* eslint-disable @typescript-eslint/no-explicit-any */
import TrainerSprite from '../../../../components/elements/sprites/TrainerSprite';
import ItemSprite from '../../../../components/elements/sprites/ItemSprite';
import { formatReadableName } from '../../../../utils/functions';
import './styles.scss';

type Props = {
  trainer: any;
};

export default function TrainerHeaderCard({ trainer }: Props) {
  const { name, trainerClass, trainerPic, items, doubleBattle, location, party } = trainer;

  const locationName = location?.locationKey ? formatReadableName(location.locationKey) : null;
  const mapName = location?.mapKey ? formatReadableName(location.mapKey) : null;

  const maxLevel = party?.reduce((max: number, p: any) => Math.max(max, p.level ?? 0), 0) ?? 0;
  const partyCount = party?.length ?? 0;

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
          <div className="stat-block">
            <span className="stat-label">Party</span>
            <span className="stat-value">{partyCount}</span>
          </div>
          <div className="stat-divider" />
          <div className="stat-block">
            <span className="stat-label">Max Level</span>
            <span className="stat-value">{maxLevel || '—'}</span>
          </div>
          {locationName && (
            <>
              <div className="stat-divider" />
              <div className="stat-block stat-block--location">
                <span className="stat-label">Location</span>
                <span className="stat-value stat-value--location">
                  {locationName}
                  {mapName && mapName !== locationName && (
                    <span className="stat-map"> · {mapName}</span>
                  )}
                </span>
              </div>
            </>
          )}
        </div>

        {items && items.length > 0 && (
          <div className="trainer-header-items">
            <span className="items-label">Items:</span>
            {items.map((item: any, i: number) => (
              <div key={i} className="trainer-item-chip">
                <ItemSprite item={item} size={20} />
                <span>{item.name || item.key}</span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
