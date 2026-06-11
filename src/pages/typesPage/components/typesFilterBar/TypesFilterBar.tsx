import { useRef, useState, useEffect } from 'react';
import type { TypeSortOption } from '../../TypesPage';
import './styles.scss';

const SORT_OPTIONS: { value: TypeSortOption; label: string }[] = [
  { value: 'alpha', label: 'A → Z' },
  { value: 'pokemon-count', label: 'Most Pokémon' },
  { value: 'move-count', label: 'Most Moves' },
];

function SortDropdown({
  value,
  onChange,
}: {
  value: TypeSortOption;
  onChange: (v: TypeSortOption) => void;
}) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const h = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener('mousedown', h);
    return () => document.removeEventListener('mousedown', h);
  }, []);

  const label = SORT_OPTIONS.find((o) => o.value === value)?.label ?? 'Sort';

  return (
    <div className={`ms-dropdown ms-dropdown--sort ${open ? 'ms-dropdown--open' : ''}`} ref={ref}>
      <button className="ms-dropdown__trigger" onClick={() => setOpen((v) => !v)}>
        <span>↕ {label}</span>
        <span className="ms-dropdown__chevron">{open ? '▲' : '▼'}</span>
      </button>
      {open && (
        <div className="ms-dropdown__menu">
          {SORT_OPTIONS.map((opt) => (
            <button
              key={opt.value}
              className={`ms-dropdown__option ${value === opt.value ? 'ms-dropdown__option--selected' : ''}`}
              onClick={() => {
                onChange(opt.value);
                setOpen(false);
              }}
            >
              <span className="ms-dropdown__checkbox">{value === opt.value ? '✓' : ''}</span>
              <span>{opt.label}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

interface Props {
  searchTerm: string;
  setSearchTerm: (v: string) => void;
  sortBy: TypeSortOption;
  setSortBy: (v: TypeSortOption) => void;
  primaryOnly: boolean;
  setPrimaryOnly: (v: boolean) => void;
  showUnreleased: boolean;
  setShowUnreleased: (v: boolean) => void;
  clearAll: () => void;
}

export default function TypesFilterBar({
  searchTerm,
  setSearchTerm,
  sortBy,
  setSortBy,
  primaryOnly,
  setPrimaryOnly,
  showUnreleased,
  setShowUnreleased,
  clearAll,
}: Props) {
  const hasAnyFilter = searchTerm || primaryOnly || showUnreleased || sortBy !== 'alpha';

  return (
    <div className="types-filter-bar">
      <div className="filter-bar__controls">
        <input
          className="items-search-input"
          type="text"
          placeholder="Search types…"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />

        <SortDropdown value={sortBy} onChange={setSortBy} />

        <label className="obtainable-toggle">
          <input
            type="checkbox"
            checked={primaryOnly}
            onChange={(e) => setPrimaryOnly(e.target.checked)}
          />
          Primary type only
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
    </div>
  );
}
