/* eslint-disable @typescript-eslint/no-explicit-any */
import { useState, useMemo } from 'react';
import { useData } from '../../../../contexts/dataContext';
import { Link } from 'react-router-dom';
import CollapseToggle from '../../../../components/elements/collapseToggle/CollapseToggle';
import ExportToggleButton from '../../../../components/elements/exportToggleButton/ExportToggleButton';
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
    const results: { trainer: any; mon: any; baseKey: string; locationKey: string }[] = [];
    const selected = (pokemon as any)[selectedKey];
    if (!selected) return results;

    (selected.trainers || []).forEach((tRef: any) => {
      for (const [baseKey, group] of Object.entries(trainers) as [string, any][]) {
        const variant = group.variants.find((v: any) => v.key === tRef.trainerKey);

        if (variant && variant.isPlaced) {
          const monInParty = variant.party.find((m: any) => m.species?.key === selectedKey);

          if (monInParty) {
            const isDuplicate = results.some(
              (item) => item.trainer.key === variant.key && item.mon.level === monInParty.level,
            );
            if (!isDuplicate) {
              results.push({
                trainer: variant,
                mon: monInParty,
                baseKey,
                locationKey: variant.location?.locationKey || '',
              });
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
                <TrainerUsageRow key={i} item={item} selectedKey={selectedKey} />
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

// ── Individual trainer row ────────────────────────────────────────────────────
function TrainerUsageRow({
  item,
  selectedKey,
}: {
  item: { trainer: any; mon: any; baseKey: string; locationKey: string };
  selectedKey: string;
}) {
  const [exportMode, setExportMode] = useState(false);

  return (
    <div className="trainer-usage-row">
      <div className="trainer-meta">
        <div className="trainer-location-info">
          <Link
            to={`/locations/${item.locationKey}`}
            className="location-name"
            title="View location"
          >
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
            <ExportToggleButton active={exportMode} onToggle={() => setExportMode((m) => !m)} />
          </div>
          <div className="loc-party-groups">
            {(() => {
              const groups: any[][] = [];
              for (let i = 0; i < item.trainer.party.length; i += 3) {
                groups.push(item.trainer.party.slice(i, i + 3));
              }
              return groups.map((group, gi) => (
                <div key={gi} className="loc-party-group">
                  {group.map((mon: any, idx: number) => (
                    <TrainerPokemonCard
                      key={gi * 3 + idx}
                      pokemon={mon}
                      exportMode={exportMode}
                      highlight={mon.species?.key === selectedKey}
                    />
                  ))}
                </div>
              ));
            })()}
          </div>
        </div>
      </div>
    </div>
  );
}
