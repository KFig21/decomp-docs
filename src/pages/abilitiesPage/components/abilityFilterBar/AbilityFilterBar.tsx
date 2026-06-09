import './styles.scss';

export type AbilitySortOption = 'alpha-asc' | 'alpha-desc' | 'pokemon-desc' | 'pokemon-asc';

export const ABILITY_SORT_OPTIONS: { value: AbilitySortOption; label: string }[] = [
  { value: 'alpha-asc', label: 'A → Z' },
  { value: 'alpha-desc', label: 'Z → A' },
  { value: 'pokemon-desc', label: 'Most Pokémon' },
  { value: 'pokemon-asc', label: 'Fewest Pokémon' },
];

type Props = {
  searchTerm: string;
  setSearchTerm: (v: string) => void;
  sortBy: AbilitySortOption;
  setSortBy: (v: AbilitySortOption) => void;
  totalCount: number;
};

export default function AbilityFilterBar({
  searchTerm,
  setSearchTerm,
  sortBy,
  setSortBy,
  totalCount,
}: Props) {
  return (
    <div className="ability-filter-bar">
      <input
        className="ability-search-input"
        placeholder="Search abilities…"
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
      />
      <select
        className="ability-sort-select"
        value={sortBy}
        onChange={(e) => setSortBy(e.target.value as AbilitySortOption)}
      >
        {ABILITY_SORT_OPTIONS.map((o) => (
          <option key={o.value} value={o.value}>
            {o.label}
          </option>
        ))}
      </select>
      <span className="ability-filter-count">{totalCount} abilities</span>
    </div>
  );
}
