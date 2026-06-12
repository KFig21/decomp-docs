import type { PokemonActiveFilters } from '../../PokemonPage';
import PokemonSearch from './components/PokemonSearch';
import Type1Dropdown from './components/Type1Dropdown';
import Type2Dropdown from './components/Type2Dropdown';
import EncounterDropdown from './components/EncounterDropdown';
import DexSelector from './components/DexSelector';
import PokemonSort from './components/PokemonSort';
import BstRange from './components/BstRange';
import FilterCheckbox from './components/FilterCheckbox';
// import MoveSearch from './components/MoveSearch';

interface Props {
  searchTerm: string;
  setSearchTerm: (v: string) => void;
  activeFilters: PokemonActiveFilters;
  onToggleType1: (v: string) => void;
  onToggleType2: (v: string) => void;
  onToggleEncounter: (v: string) => void;
  showObtainableOnly: boolean;
  setShowObtainableOnly: (v: boolean) => void;
  showEvolvesWithItem: boolean;
  setShowEvolvesWithItem: (v: boolean) => void;
  showUnreleased: boolean;
  setShowUnreleased: (v: boolean) => void;
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
  setSelectedDex: (v: string) => void;
}

export default function PokemonFilterControls({
  searchTerm,
  setSearchTerm,
  activeFilters,
  onToggleType1,
  onToggleType2,
  onToggleEncounter,
  showObtainableOnly,
  setShowObtainableOnly,
  showEvolvesWithItem,
  setShowEvolvesWithItem,
  showUnreleased,
  setShowUnreleased,
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
  setSelectedDex,
}: Props) {
  return (
    <div className="filter-bar__controls">
      <PokemonSearch value={searchTerm} onChange={setSearchTerm} />
      <Type1Dropdown selected={activeFilters.types1} onToggle={onToggleType1} />
      <Type2Dropdown selected={activeFilters.types2} onToggle={onToggleType2} />
      <EncounterDropdown selected={activeFilters.encounters} onToggle={onToggleEncounter} />
      <DexSelector
        availableDexTypes={availableDexTypes}
        selectedDex={selectedDex}
        setSelectedDex={setSelectedDex}
      />
      <PokemonSort value={sortBy} onChange={setSortBy} />
      <BstRange minBst={minBst} setMinBst={setMinBst} maxBst={maxBst} setMaxBst={setMaxBst} />
      {/* <MoveSearch value={moveFilter} onChange={setMoveFilter} /> */}
      <FilterCheckbox
        label="Obtainable only"
        checked={showObtainableOnly}
        onChange={setShowObtainableOnly}
      />
      <FilterCheckbox
        label="Evolves with item"
        checked={showEvolvesWithItem}
        onChange={setShowEvolvesWithItem}
      />
      <FilterCheckbox
        label="Show unreleased"
        checked={showUnreleased}
        onChange={setShowUnreleased}
        modifier="unreleased"
      />
    </div>
  );
}
