import TrainerCard from '../trainerCard/TrainerCard';
import TrainerPokemonCard from '../pokemonCard/TrainerPokemonCard';
import './styles.scss';
import type { ParsedTrainerVariant } from '../../../../../../../../services/parsers/v2/trainers/types';
import { useTrainerTab } from '../../../../../../../../contexts/trainerTabContext';

type Props = {
  trainerGroup: ParsedTrainerVariant[];
};

// Typically used for rivals (mudkip party, treeko party, torchic party)
function formatTabName(key: string, index: number) {
  const parts = key.split('_');
  const lastPart = parts[parts.length - 1];

  if (!lastPart) return `Team ${index + 1}`;

  if (!isNaN(Number(lastPart))) {
    return `Variant ${lastPart}`;
  }

  return lastPart.charAt(0).toUpperCase() + lastPart.slice(1).toLowerCase();
}

export default function PartyCard({ trainerGroup }: Props) {
  const { globalTab, setGlobalTab } = useTrainerTab();

  // Find if our universal tab exists in this specific trainer group
  let activeIndex = 0;
  if (globalTab) {
    const matchingIndex = trainerGroup.findIndex((t, i) => formatTabName(t.key, i) === globalTab);
    if (matchingIndex !== -1) {
      activeIndex = matchingIndex;
    }
  }

  const activeTrainer = trainerGroup[activeIndex];

  if (!activeTrainer) return null;

  return (
    <div className="party-card-container">
      <TrainerCard trainer={activeTrainer} />

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
            <TrainerPokemonCard key={i} pokemon={mon} />
          ))}
        </div>
      </div>
    </div>
  );
}
