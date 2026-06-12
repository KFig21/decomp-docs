import { THREAT_ABILITY_COLOR } from '../../../../constants/threatAbilities';
import SortDropdown from '../../../../components/filterBar/SortDropdown';
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
  showUnreleased: boolean;
  setShowUnreleased: (v: boolean) => void;
  showThreatAbilitiesOnly: boolean;
  setShowThreatAbilitiesOnly: (v: boolean) => void;
};

export default function AbilityFilterBar({
  searchTerm,
  setSearchTerm,
  sortBy,
  setSortBy,
  totalCount,
  showUnreleased,
  setShowUnreleased,
  showThreatAbilitiesOnly,
  setShowThreatAbilitiesOnly,
}: Props) {
  return (
    <div className="ability-filter-bar">
      <input
        className="ability-search-input"
        placeholder="Search abilities…"
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
      />

      <SortDropdown
        value={sortBy}
        onChange={(v) => setSortBy(v as AbilitySortOption)}
        options={ABILITY_SORT_OPTIONS}
      />

      <label
        className="obtainable-toggle"
        style={
          showThreatAbilitiesOnly
            ? ({ '--toggle-color': THREAT_ABILITY_COLOR } as React.CSSProperties)
            : {}
        }
      >
        <input
          type="checkbox"
          checked={showThreatAbilitiesOnly}
          onChange={(e) => setShowThreatAbilitiesOnly(e.target.checked)}
        />
        Threat abilities only
      </label>

      <label className="obtainable-toggle obtainable-toggle--unreleased">
        <input
          type="checkbox"
          checked={showUnreleased}
          onChange={(e) => setShowUnreleased(e.target.checked)}
        />
        Show unreleased
      </label>

      <span className="ability-filter-count">{totalCount} abilities</span>
    </div>
  );
}
