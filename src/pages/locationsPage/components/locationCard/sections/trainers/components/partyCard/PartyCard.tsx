import { useState } from 'react';
import TrainerCard from '../trainerCard/TrainerCard';
import TrainerPokemonCard from '../pokemonCard/TrainerPokemonCard';
import './styles.scss';
import type { ParsedTrainerVariant } from '../../../../../../../../services/parsers/v2/trainers/types';
import { useTrainerTab } from '../../../../../../../../contexts/trainerTabContext';

type Props = {
  trainerGroup: ParsedTrainerVariant[];
};

function formatTabName(key: string, index: number) {
  const parts = key.split('_');
  const lastPart = parts[parts.length - 1];
  if (!lastPart) return `Team ${index + 1}`;
  if (!isNaN(Number(lastPart))) return `Variant ${lastPart}`;
  return lastPart.charAt(0).toUpperCase() + lastPart.slice(1).toLowerCase();
}

export default function PartyCard({ trainerGroup }: Props) {
  const { globalTab, setGlobalTab } = useTrainerTab();
  const [exportMode, setExportMode] = useState(false);

  let activeIndex = 0;
  if (globalTab) {
    const matchingIndex = trainerGroup.findIndex((t, i) => formatTabName(t.key, i) === globalTab);
    if (matchingIndex !== -1) activeIndex = matchingIndex;
  }

  const activeTrainer = trainerGroup[activeIndex];
  if (!activeTrainer) return null;

  return (
    <div className="party-card-container">
      {/* Left column: trainer card + export button */}
      <div className="trainer-left-col">
        <TrainerCard trainer={activeTrainer} />
        <button
          className={`export-toggle-btn ${exportMode ? 'export-toggle-btn--active' : ''}`}
          onClick={() => setExportMode((m) => !m)}
          title="Toggle Showdown export view"
        >
          {exportMode ? 'Normal' : 'Export'}
        </button>
      </div>

      {/* Right side: starter tabs + party */}
      <div className="trainer-party-area">
        {trainerGroup.length > 1 && (
          <div className="trainer-tabs">
            {trainerGroup.map((t, i) => {
              const tabName = formatTabName(t.key, i);
              return (
                <button
                  key={t.key}
                  className={`tab-button ${i === activeIndex ? 'active' : ''}`}
                  onClick={() => setGlobalTab(tabName)}
                >
                  {tabName}
                </button>
              );
            })}
          </div>
        )}

        <div className="trainer-party">
          {activeTrainer.party?.map((mon, i) => (
            <TrainerPokemonCard key={i} pokemon={mon} exportMode={exportMode} />
          ))}
        </div>
      </div>
    </div>
  );
}
