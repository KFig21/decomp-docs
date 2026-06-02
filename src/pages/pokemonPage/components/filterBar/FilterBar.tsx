import './styles.scss';

type Props = {
  searchTerm: string;
  setSearchTerm: (val: string) => void;
  showObtainableOnly: boolean;
  setShowObtainableOnly: (val: boolean) => void;
  typeFilter: string;
  setTypeFilter: (val: string) => void;
  encounterFilter: string;
  setEncounterFilter: (val: string) => void;
  minBst: string;
  setMinBst: (val: string) => void;
  maxBst: string;
  setMaxBst: (val: string) => void;
  moveFilter: string;
  setMoveFilter: (val: string) => void;
  sortBy: string;
  setSortBy: (val: string) => void;
};

const TYPES = [
  'All',
  'Normal',
  'Fire',
  'Water',
  'Electric',
  'Grass',
  'Ice',
  'Fighting',
  'Poison',
  'Ground',
  'Flying',
  'Psychic',
  'Bug',
  'Rock',
  'Ghost',
  'Dragon',
  'Dark',
  'Steel',
  'Fairy',
];
const ENCOUNTERS = [
  'All',
  'Land',
  'Surfing',
  'Fishing',
  'Old Rod',
  'Good Rod',
  'Super Rod',
  'Static',
];

export default function FilterBar(props: Props) {
  return (
    <div className="pokemon-filter-bar">
      {/* Name search */}
      <div className="filter-row">
        <div className="input-group search-group">
          <input
            type="text"
            placeholder="Search Pokémon name..."
            value={props.searchTerm}
            onChange={(e) => props.setSearchTerm(e.target.value)}
          />
        </div>
        {/* Sort by */}
        <div className="input-group">
          <label>Sort By</label>
          <select value={props.sortBy} onChange={(e) => props.setSortBy(e.target.value)}>
            <option value="pokedex">Pokédex #</option>
            <option value="alpha">Alphabetical (A-Z)</option>
            <option value="bst">BST (High to Low)</option>
            <option value="type">Primary Type</option>
          </select>
        </div>
        {/* Obtainable toggle */}
        <div className="input-group checkbox-group">
          <label className="toggle-label">
            <input
              type="checkbox"
              checked={props.showObtainableOnly}
              onChange={(e) => props.setShowObtainableOnly(e.target.checked)}
            />
            Obtainable Only
          </label>
        </div>
        {/* Type filter */}
        <div className="input-group">
          <label>Type</label>
          <select value={props.typeFilter} onChange={(e) => props.setTypeFilter(e.target.value)}>
            {TYPES.map((t) => (
              <option key={t} value={t}>
                {t}
              </option>
            ))}
          </select>
        </div>
        {/* Encounter type filter */}
        <div className="input-group">
          <label>Encounter</label>
          <select
            value={props.encounterFilter}
            onChange={(e) => props.setEncounterFilter(e.target.value)}
          >
            {ENCOUNTERS.map((e) => (
              <option key={e} value={e}>
                {e}
              </option>
            ))}
          </select>
        </div>
        {/* BST range filter */}
        <div className="input-group bst-group">
          <label>BST Range</label>
          <input
            type="number"
            placeholder="Min"
            value={props.minBst}
            onChange={(e) => props.setMinBst(e.target.value)}
          />
          <span>-</span>
          <input
            type="number"
            placeholder="Max"
            value={props.maxBst}
            onChange={(e) => props.setMaxBst(e.target.value)}
          />
        </div>
        {/* Move search */}
        <div className="input-group">
          <label>Move</label>
          <input
            type="text"
            placeholder="Search learnable move..."
            value={props.moveFilter}
            onChange={(e) => props.setMoveFilter(e.target.value)}
          />
        </div>
      </div>
    </div>
  );
}
