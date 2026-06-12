import FilterPill from '../../../../components/filterBar/FilterPill';
import type { PokemonActiveFilters } from '../../PokemonPage';
import {
  SORT_OPTIONS,
  ENCOUNTER_OPTIONS,
  TYPE_COLORS,
  TYPE1_COLOR,
  TYPE2_COLOR,
  ENCOUNTER_COLOR,
  dexTypeLabel,
} from './constants';
import {
  THREAT_MOVE_OPTIONS,
  THREAT_MOVE_COLOR,
  THREAT_MOVE_ALL,
} from '../../../../constants/threatMoves';

interface Props {
  searchTerm: string;
  setSearchTerm: (v: string) => void;
  showObtainableOnly: boolean;
  setShowObtainableOnly: (v: boolean) => void;
  showEvolvesWithItem: boolean;
  setShowEvolvesWithItem: (v: boolean) => void;
  showUnreleased: boolean;
  setShowUnreleased: (v: boolean) => void;
  activeFilters: PokemonActiveFilters;
  removeFilter: (cat: keyof PokemonActiveFilters, value: string) => void;
  clearAll: () => void;
  minBst: string;
  setMinBst: (v: string) => void;
  maxBst: string;
  setMaxBst: (v: string) => void;
  moveFilter: string;
  setMoveFilter: (v: string) => void;
  sortBy: string;
  setSortBy: (v: string) => void;
  availableDexTypes: string[];
  selectedDex: string;
  defaultDex: string;
  setSelectedDex: (v: string) => void;
}

export default function PokemonFilterPills({
  searchTerm,
  setSearchTerm,
  showObtainableOnly,
  setShowObtainableOnly,
  showEvolvesWithItem,
  setShowEvolvesWithItem,
  showUnreleased,
  setShowUnreleased,
  activeFilters,
  removeFilter,
  clearAll,
  minBst,
  setMinBst,
  maxBst,
  setMaxBst,
  moveFilter,
  setMoveFilter,
  sortBy,
  setSortBy,
  availableDexTypes,
  selectedDex,
  defaultDex,
  setSelectedDex,
}: Props) {
  return (
    <div className="filter-bar__pills">
      <button className="filter-clear-all" onClick={clearAll}>
        Clear all
      </button>

      {searchTerm && (
        <FilterPill label={`"${searchTerm}"`} onRemove={() => setSearchTerm('')} />
      )}
      {showObtainableOnly && (
        <FilterPill label="Obtainable only" onRemove={() => setShowObtainableOnly(false)} />
      )}
      {showEvolvesWithItem && (
        <FilterPill
          label="Evolves with item"
          color="#e67e22"
          onRemove={() => setShowEvolvesWithItem(false)}
        />
      )}
      {showUnreleased && (
        <FilterPill label="Show unreleased" color="#888" onRemove={() => setShowUnreleased(false)} />
      )}
      {activeFilters.types1.map((v) => (
        <FilterPill
          key={`t1-${v}`}
          label={`Type: ${v}`}
          color={TYPE_COLORS[v.toLowerCase()] ?? TYPE1_COLOR}
          onRemove={() => removeFilter('types1', v)}
        />
      ))}
      {activeFilters.types2.map((v) => (
        <FilterPill
          key={`t2-${v}`}
          label={`& Type: ${v}`}
          color={TYPE2_COLOR}
          onRemove={() => removeFilter('types2', v)}
        />
      ))}
      {activeFilters.encounters.map((v) => (
        <FilterPill
          key={`enc-${v}`}
          label={ENCOUNTER_OPTIONS.find((e) => e.value === v)?.label ?? v}
          color={ENCOUNTER_COLOR}
          onRemove={() => removeFilter('encounters', v)}
        />
      ))}
      {activeFilters.threatMoves.map((v) => (
        <FilterPill
          key={`threat-${v}`}
          label={
            v === THREAT_MOVE_ALL
              ? 'Any Threat Move'
              : (THREAT_MOVE_OPTIONS.find((o) => o.value === v)?.label ?? v)
          }
          color={THREAT_MOVE_COLOR}
          onRemove={() => removeFilter('threatMoves', v)}
        />
      ))}
      {(minBst || maxBst) && (
        <FilterPill
          label={`BST ${minBst || '0'} – ${maxBst || '∞'}`}
          onRemove={() => {
            setMinBst('');
            setMaxBst('');
          }}
        />
      )}
      {moveFilter && (
        <FilterPill label={`Move: ${moveFilter}`} onRemove={() => setMoveFilter('')} />
      )}
      {availableDexTypes.length > 1 && selectedDex !== defaultDex && (
        <FilterPill
          label={`Dex: ${dexTypeLabel(selectedDex)}`}
          onRemove={() => setSelectedDex(defaultDex)}
        />
      )}
      {sortBy !== 'pokedex' && (
        <FilterPill
          label={`Sort: ${SORT_OPTIONS.find((o) => o.value === sortBy)?.label}`}
          onRemove={() => setSortBy('pokedex')}
        />
      )}
    </div>
  );
}
