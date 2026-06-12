// decomp-docs/src/pages/movesPage/components/moveFilterBar/MoveFilterBar.tsx
import type { MoveActiveFilters, MoveSortOption } from '../../MovesPage';
import { MOVE_SORT_OPTIONS } from '../../MovesPage';
import {
  TYPE_COLORS,
  TYPE_OPTIONS,
} from '../../../pokemonPage/components/pokemonFilterBar/PokemonFilterBar';
import { CategoryIcon } from '../../../../components/elements/categoryBadge/CategoryBadge';
import TypeIconBadge from '../../../../components/elements/typeBadge/TypeIconBadge';
import MultiDropdown from '../../../../components/filterBar/MultiDropdown';
import SortDropdown from '../../../../components/filterBar/SortDropdown';
import FilterPill from '../../../../components/filterBar/FilterPill';
import './styles.scss';

const CATEGORY_OPTIONS = [
  { value: 'Physical', label: 'Physical', icon: <CategoryIcon raw="Physical" size={13} /> },
  { value: 'Special', label: 'Special', icon: <CategoryIcon raw="Special" size={13} /> },
  { value: 'Status', label: 'Status', icon: <CategoryIcon raw="Status" size={13} /> },
];

const CATEGORY_COLORS: Record<string, string> = {
  Physical: '#c03028',
  Special: '#6890f0',
  Status: '#a040a0',
};

// ── MoveFilterBar ─────────────────────────────────────────────────────────────
interface Props {
  searchTerm: string;
  setSearchTerm: (v: string) => void;
  activeFilters: MoveActiveFilters;
  setActiveFilters: React.Dispatch<React.SetStateAction<MoveActiveFilters>>;
  sortBy: MoveSortOption;
  setSortBy: (v: MoveSortOption) => void;
  hasTmOnly: boolean;
  setHasTmOnly: (v: boolean) => void;
  showUnreleased: boolean;
  setShowUnreleased: (v: boolean) => void;
  minPower: string;
  setMinPower: (v: string) => void;
  maxPower: string;
  setMaxPower: (v: string) => void;
  allEffects: string[];
  removeFilter: (cat: keyof MoveActiveFilters, value: string) => void;
  clearAll: () => void;
}

export default function MoveFilterBar({
  searchTerm,
  setSearchTerm,
  activeFilters,
  setActiveFilters,
  sortBy,
  setSortBy,
  hasTmOnly,
  setHasTmOnly,
  showUnreleased,
  setShowUnreleased,
  minPower,
  setMinPower,
  maxPower,
  setMaxPower,
  allEffects,
  removeFilter,
  clearAll,
}: Props) {
  const toggle = (cat: keyof MoveActiveFilters) => (v: string) =>
    setActiveFilters((prev) => ({
      ...prev,
      [cat]: prev[cat].includes(v) ? prev[cat].filter((x) => x !== v) : [...prev[cat], v],
    }));

  const typeOptions = TYPE_OPTIONS.map((t) => ({
    value: t,
    label: t,
    color: TYPE_COLORS[t.toLowerCase()],
    icon: <TypeIconBadge type={t} size={14} />,
  }));
  const catOptions = CATEGORY_OPTIONS.map((c) => ({ ...c, color: CATEGORY_COLORS[c.value] }));
  const fxOptions = allEffects.map((e) => ({ value: e, label: e }));

  const hasAnyFilter =
    searchTerm ||
    hasTmOnly ||
    showUnreleased ||
    activeFilters.types.length > 0 ||
    activeFilters.categories.length > 0 ||
    activeFilters.effects.length > 0 ||
    minPower ||
    maxPower ||
    sortBy !== 'alpha-asc';

  return (
    <div className="moves-filter-bar">
      <div className="filter-bar__controls">
        <input
          className="items-search-input"
          type="text"
          placeholder="Search moves…"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />

        <MultiDropdown
          label="Type"
          options={typeOptions}
          selected={activeFilters.types}
          onToggle={toggle('types')}
          accentColor="#6890f0"
          maxHeight={280}
        />

        <MultiDropdown
          label="Category"
          options={catOptions}
          selected={activeFilters.categories}
          onToggle={toggle('categories')}
          accentColor="#c03028"
        />

        <MultiDropdown
          label="Effect"
          options={fxOptions}
          selected={activeFilters.effects}
          onToggle={toggle('effects')}
          accentColor="#a8b820"
          maxHeight={280}
        />

        <SortDropdown
          value={sortBy}
          onChange={(v) => setSortBy(v as MoveSortOption)}
          options={MOVE_SORT_OPTIONS}
        />

        <div className="bst-range">
          <span className="bst-range__label">Power</span>
          <input
            type="number"
            placeholder="Min"
            value={minPower}
            onChange={(e) => setMinPower(e.target.value)}
            className="bst-range__input"
          />
          <span className="bst-range__sep">–</span>
          <input
            type="number"
            placeholder="Max"
            value={maxPower}
            onChange={(e) => setMaxPower(e.target.value)}
            className="bst-range__input"
          />
        </div>

        <label className="obtainable-toggle">
          <input
            type="checkbox"
            checked={hasTmOnly}
            onChange={(e) => setHasTmOnly(e.target.checked)}
          />
          TM / HM only
        </label>

        <label className="obtainable-toggle obtainable-toggle--unreleased">
          <input
            type="checkbox"
            checked={showUnreleased}
            onChange={(e) => setShowUnreleased(e.target.checked)}
          />
          Show unreleased
        </label>

        {hasAnyFilter && (
          <button className="filter-clear-all" onClick={clearAll}>
            Clear all
          </button>
        )}
      </div>

      {hasAnyFilter && (
        <div className="filter-bar__pills">
          {searchTerm && (
            <FilterPill label={`"${searchTerm}"`} onRemove={() => setSearchTerm('')} />
          )}
          {hasTmOnly && <FilterPill label="TM / HM only" onRemove={() => setHasTmOnly(false)} />}
          {showUnreleased && (
            <FilterPill
              label="Show unreleased"
              color="#888"
              onRemove={() => setShowUnreleased(false)}
            />
          )}
          {activeFilters.types.map((v) => (
            <FilterPill
              key={v}
              label={v}
              color={TYPE_COLORS[v.toLowerCase()]}
              onRemove={() => removeFilter('types', v)}
            />
          ))}
          {activeFilters.categories.map((v) => (
            <FilterPill
              key={v}
              label={v}
              color={CATEGORY_COLORS[v]}
              onRemove={() => removeFilter('categories', v)}
            />
          ))}
          {activeFilters.effects.map((v) => (
            <FilterPill
              key={v}
              label={v}
              color="#a8b820"
              onRemove={() => removeFilter('effects', v)}
            />
          ))}
          {(minPower || maxPower) && (
            <FilterPill
              label={`Power ${minPower || '0'} – ${maxPower || '∞'}`}
              onRemove={() => {
                setMinPower('');
                setMaxPower('');
              }}
            />
          )}
          {sortBy !== 'alpha-asc' && (
            <FilterPill
              label={`Sort: ${MOVE_SORT_OPTIONS.find((o) => o.value === sortBy)?.label}`}
              onRemove={() => setSortBy('alpha-asc')}
            />
          )}
        </div>
      )}
    </div>
  );
}
