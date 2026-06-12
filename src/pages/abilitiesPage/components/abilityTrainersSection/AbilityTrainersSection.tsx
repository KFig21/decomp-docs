/* eslint-disable @typescript-eslint/no-explicit-any */
import { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { useData } from '../../../../contexts/dataContext';
import CollapseToggle from '../../../../components/elements/collapseToggle/CollapseToggle';
import TrainerCard from '../../../locationsPage/components/locationCard/sections/trainers/components/trainerCard/TrainerCard';
import TrainerPokemonCard from '../../../locationsPage/components/locationCard/sections/trainers/components/pokemonCard/TrainerPokemonCard';
import { formatReadableName } from '../../../../utils/functions';
import './styles.scss';

type TrainerRow = {
  trainer: any;
  locationKey: string;
};

type Props = { abilityKey: string };

export default function AbilityTrainersSection({ abilityKey }: Props) {
  const { trainers } = useData();
  const [isOpen, setIsOpen] = useState(true);

  const rows = useMemo<TrainerRow[]>(() => {
    const results: TrainerRow[] = [];
    for (const group of Object.values(trainers as Record<string, any>)) {
      const variants: any[] = (group.variants ?? []).filter((v: any) => v.isPlaced);
      for (const variant of variants) {
        const hasAbility = (variant.party ?? []).some(
          (mon: any) => mon.ability?.key === abilityKey,
        );
        if (hasAbility) {
          results.push({
            trainer: variant,
            locationKey: variant.location?.locationKey || '',
          });
        }
      }
    }
    return results;
  }, [trainers, abilityKey]);

  return (
    <div className={`section ability-card-style ${isOpen ? '' : 'collapsed'}`}>
      <div className="section-header" onClick={() => setIsOpen(!isOpen)}>
        <CollapseToggle isOpen={isOpen} />
        <span>Trainers ({rows.length})</span>
      </div>
      {isOpen && (
        <div className="content">
          {rows.length > 0 ? (
            <div className="ability-trainers-list">
              {rows.map((item, i) => (
                <TrainerUsageRow key={i} item={item} abilityKey={abilityKey} />
              ))}
            </div>
          ) : (
            <p className="empty-state">No trainers have Pokémon with this ability.</p>
          )}
        </div>
      )}
    </div>
  );
}

function TrainerUsageRow({ item, abilityKey }: { item: TrainerRow; abilityKey: string }) {
  const groups: any[][] = [];
  for (let i = 0; i < item.trainer.party.length; i += 3) {
    groups.push(item.trainer.party.slice(i, i + 3));
  }

  return (
    <div className="trainer-usage-row">
      <div className="trainer-meta">
        <div className="trainer-location-info">
          <Link to={`/locations/${item.locationKey}`} className="location-name" title="View location">
            {formatReadableName(item.trainer.location?.locationKey || 'Unknown')}
          </Link>
          <span className="map-name">
            {formatReadableName(item.trainer.location?.mapKey || 'Unknown')}
          </span>
        </div>
      </div>
      <div className="trainer-party-container">
        <div className="trainer-party-full">
          <div className="trainer-party-left">
            <TrainerCard trainer={item.trainer} />
          </div>
          <div className="loc-party-groups">
            {groups.map((group, gi) => (
              <div key={gi} className="loc-party-group">
                {group.map((mon: any, idx: number) => (
                  <TrainerPokemonCard
                    key={gi * 3 + idx}
                    pokemon={mon}
                    exportMode={false}
                    highlight={mon.ability?.key === abilityKey}
                  />
                ))}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
