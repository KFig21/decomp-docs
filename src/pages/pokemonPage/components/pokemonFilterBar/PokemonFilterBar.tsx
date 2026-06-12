/* eslint-disable react-refresh/only-export-components */
import type { PokemonActiveFilters } from '../../PokemonPage';
import PokemonFilterControls from './PokemonFilterControls';
import PokemonFilterPills from './PokemonFilterPills';
import './styles.scss';

// Re-export constants used by other pages (e.g. MoveFilterBar, TypesPage)
export { TYPE_OPTIONS, TYPE_COLORS, ENCOUNTER_OPTIONS, dexTypeLabel } from './constants';

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
  setActiveFilters: React.Dispatch<React.SetStateAction<PokemonActiveFilters>>;
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
  setSelectedDex: (v: string) => void;
}

export default function PokemonFilterBar({
  searchTerm,
  setSearchTerm,
  showObtainableOnly,
  setShowObtainableOnly,
  showEvolvesWithItem,
  setShowEvolvesWithItem,
  showUnreleased,
  setShowUnreleased,
  activeFilters,
  setActiveFilters,
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
  setSelectedDex,
}: Props) {
  const toggle = (cat: keyof PokemonActiveFilters) => (v: string) =>
    setActiveFilters((prev) => ({
      ...prev,
      [cat]: prev[cat].includes(v) ? prev[cat].filter((x) => x !== v) : [...prev[cat], v],
    }));

  const defaultDex = availableDexTypes[0] ?? 'NATIONAL_DEX';

  const hasAnyFilter =
    searchTerm ||
    showObtainableOnly ||
    showEvolvesWithItem ||
    showUnreleased ||
    activeFilters.types1.length > 0 ||
    activeFilters.types2.length > 0 ||
    activeFilters.encounters.length > 0 ||
    minBst ||
    maxBst ||
    moveFilter ||
    sortBy !== 'pokedex' ||
    (availableDexTypes.length > 1 && selectedDex !== defaultDex);

  return (
    <div className="pokemon-filter-bar">
      <PokemonFilterControls
        searchTerm={searchTerm}
        setSearchTerm={setSearchTerm}
        activeFilters={activeFilters}
        onToggleType1={toggle('types1')}
        onToggleType2={toggle('types2')}
        onToggleEncounter={toggle('encounters')}
        showObtainableOnly={showObtainableOnly}
        setShowObtainableOnly={setShowObtainableOnly}
        showEvolvesWithItem={showEvolvesWithItem}
        setShowEvolvesWithItem={setShowEvolvesWithItem}
        showUnreleased={showUnreleased}
        setShowUnreleased={setShowUnreleased}
        minBst={minBst}
        setMinBst={setMinBst}
        maxBst={maxBst}
        setMaxBst={setMaxBst}
        moveFilter={moveFilter}
        setMoveFilter={setMoveFilter}
        sortBy={sortBy}
        setSortBy={setSortBy}
        availableDexTypes={availableDexTypes}
        selectedDex={selectedDex}
        setSelectedDex={setSelectedDex}
      />

      {hasAnyFilter && (
        <PokemonFilterPills
          searchTerm={searchTerm}
          setSearchTerm={setSearchTerm}
          showObtainableOnly={showObtainableOnly}
          setShowObtainableOnly={setShowObtainableOnly}
          showEvolvesWithItem={showEvolvesWithItem}
          setShowEvolvesWithItem={setShowEvolvesWithItem}
          showUnreleased={showUnreleased}
          setShowUnreleased={setShowUnreleased}
          activeFilters={activeFilters}
          removeFilter={removeFilter}
          clearAll={clearAll}
          minBst={minBst}
          setMinBst={setMinBst}
          maxBst={maxBst}
          setMaxBst={setMaxBst}
          moveFilter={moveFilter}
          setMoveFilter={setMoveFilter}
          sortBy={sortBy}
          setSortBy={setSortBy}
          availableDexTypes={availableDexTypes}
          selectedDex={selectedDex}
          defaultDex={defaultDex}
          setSelectedDex={setSelectedDex}
        />
      )}
    </div>
  );
}
