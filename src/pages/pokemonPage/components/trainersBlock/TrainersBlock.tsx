/* eslint-disable @typescript-eslint/no-explicit-any */
import { useState, useMemo } from 'react';
import { useData } from '../../../../contexts/dataContext';
import CollapseToggle from '../../../../components/elements/collapseToggle/CollapseToggle';
import { formatReadableName } from '../../../../utils/functions';
import TrainerCard from '../../../locationsPage/components/locationCard/sections/trainers/components/trainerCard/TrainerCard';
import TrainerPokemonCard from '../../../locationsPage/components/locationCard/sections/trainers/components/pokemonCard/TrainerPokemonCard';
import './styles.scss';

type Props = {
  selectedKey: string;
};

export default function TrainersBlock({ selectedKey }: Props) {
  const { trainers, pokemon } = useData();
  const [isOpen, setIsOpen] = useState(true);

  const trainersUsingMon = useMemo(() => {
    const results: { trainer: any; mon: any }[] = [];
    const selected = (pokemon as any)[selectedKey];
    if (!selected) return results;

    (selected.trainers || []).forEach((tRef: any) => {
      for (const group of Object.values(trainers) as any[]) {
        const variant = group.variants.find((v: any) => v.key === tRef.trainerKey);

        // ONLY process trainers that were successfully placed by the parser
        if (variant && variant.isPlaced) {
          const monInParty = variant.party.find((m: any) => m.species?.key === selectedKey);

          if (monInParty) {
            const isDuplicate = results.some(
              (item) => item.trainer.key === variant.key && item.mon.level === monInParty.level,
            );
            if (!isDuplicate) {
              results.push({ trainer: variant, mon: monInParty });
            }
          }
        }
      }
    });
    return results;
  }, [trainers, pokemon, selectedKey]);

  return (
    <div className={`section pokemon-card-style ${isOpen ? '' : 'collapsed'}`}>
      <div className="section-header" onClick={() => setIsOpen(!isOpen)}>
        <CollapseToggle isOpen={isOpen} />
        <span>Used By Trainers ({trainersUsingMon.length})</span>
      </div>
      {isOpen && (
        <div className="content">
          {trainersUsingMon.length > 0 ? (
            <div className="pokemon-detail-trainers">
              {trainersUsingMon.map((item, i) => (
                <div key={i} className="trainer-usage-row">
                  <div className="trainer-meta">
                    <div className="trainer-location-info">
                      <div className="location-name">
                        {formatReadableName(item.trainer.location?.locationKey || 'Unknown')}
                      </div>
                      <div className="map-name">
                        {formatReadableName(item.trainer.location?.mapKey || 'Unknown')}
                      </div>
                    </div>
                  </div>
                  <div className="trainer-party-container">
                    <div className="trainer-party-full">
                      <TrainerCard trainer={item.trainer} />
                      {item.trainer.party.map((mon: any, idx: number) => (
                        <TrainerPokemonCard
                          key={idx}
                          pokemon={mon}
                          highlight={mon.species?.key === selectedKey}
                        />
                      ))}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="empty-state">No trainers use this Pokémon.</p>
          )}
        </div>
      )}
    </div>
  );
}
