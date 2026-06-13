/* eslint-disable react-refresh/only-export-components */
/* eslint-disable @typescript-eslint/no-explicit-any */
import { useRef, useState, useEffect } from 'react';
import type { ActiveFilters, SortOption } from '../../ItemsPage';
import { SORT_OPTIONS } from '../../ItemsPage';
import { PocketCircle, POCKET_DISPLAY_LABELS } from '../../../../components/elements/itemPocketIcon/ItemPocketIcon';
import { MethodCircle, METHOD_LABELS } from '../../../../components/elements/itemMethodIcon/ItemMethodIcon';
import './styles.scss';

// ── Config ────────────────────────────────────────────────────────────────────

export const POCKET_OPTIONS = Object.entries(POCKET_DISPLAY_LABELS).map(([value, label]) => ({
  value,
  label,
  icon: value,
}));

export const METHOD_OPTIONS = Object.entries(METHOD_LABELS).map(([value, label]) => ({
  value,
  label,
}));

// ── Dropdown ──────────────────────────────────────────────────────────────────

interface DropdownOption {
  value: string;
  label: string;
}

interface DropdownProps {
  label: string;
  options: DropdownOption[];
  selected: string[];
  onToggle: (value: string) => void;
  optionClass?: (value: string) => string;
  renderIcon?: (opt: DropdownOption) => React.ReactNode;
}

function MultiSelectDropdown({ label, options, selected, onToggle, optionClass, renderIcon }: DropdownProps) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  return (
    <div className={`ms-dropdown ${open ? 'ms-dropdown--open' : ''}`} ref={ref}>
      <button
        className={`ms-dropdown__trigger ${selected.length > 0 ? 'ms-dropdown__trigger--active' : ''}`}
        onClick={() => setOpen((v) => !v)}
      >
        <span>{label}</span>
        {selected.length > 0 && <span className="ms-dropdown__count">{selected.length}</span>}
        <span className="ms-dropdown__chevron">{open ? '▲' : '▼'}</span>
      </button>
      {open && (
        <div className="ms-dropdown__menu">
          {options.map((opt) => {
            const isSelected = selected.includes(opt.value);
            const extraClass = isSelected && optionClass ? optionClass(opt.value) : '';
            const icon = renderIcon?.(opt);
            return (
              <button
                key={opt.value}
                className={`ms-dropdown__option ${isSelected ? 'ms-dropdown__option--selected' : ''} ${extraClass}`}
                onClick={() => onToggle(opt.value)}
              >
                <span className="ms-dropdown__checkbox">{isSelected ? '✓' : ''}</span>
                {icon && <span className="ms-dropdown__icon">{icon}</span>}
                <span>{opt.label}</span>
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}

// ── Sort dropdown (single-select) ─────────────────────────────────────────────

interface SortDropdownProps {
  value: SortOption;
  onChange: (v: SortOption) => void;
}

function SortDropdown({ value, onChange }: SortDropdownProps) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const currentLabel = SORT_OPTIONS.find((o) => o.value === value)?.label ?? 'Sort';

  return (
    <div className={`ms-dropdown ms-dropdown--sort ${open ? 'ms-dropdown--open' : ''}`} ref={ref}>
      <button className="ms-dropdown__trigger" onClick={() => setOpen((v) => !v)}>
        <span>↕ {currentLabel}</span>
        <span className="ms-dropdown__chevron">{open ? '▲' : '▼'}</span>
      </button>
      {open && (
        <div className="ms-dropdown__menu">
          {SORT_OPTIONS.map((opt) => (
            <button
              key={opt.value}
              className={`ms-dropdown__option ${value === opt.value ? 'ms-dropdown__option--selected ms-dropdown__option--sort-active' : ''}`}
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

// ── Active filter pill ────────────────────────────────────────────────────────

function FilterPill({
  label,
  colorClass,
  onRemove,
}: {
  label: string;
  colorClass?: string;
  onRemove: () => void;
}) {
  return (
    <span className={`active-pill ${colorClass ?? ''}`}>
      {label}
      <button className="active-pill__close" onClick={onRemove}>
        ×
      </button>
    </span>
  );
}

// ── FilterBar ─────────────────────────────────────────────────────────────────

interface Props {
  searchTerm: string;
  setSearchTerm: (v: string) => void;
  activeFilters: ActiveFilters;
  setActiveFilters: React.Dispatch<React.SetStateAction<ActiveFilters>>;
  evolutionOnly: boolean;
  setEvolutionOnly: (v: boolean) => void;
  heldByPokemon: boolean;
  setHeldByPokemon: (v: boolean) => void;
  removeFilter: (cat: keyof ActiveFilters, value: string) => void;
  clearAll: () => void;
  sortBy: SortOption;
  setSortBy: (v: SortOption) => void;
}

export default function ItemFilterBar({
  searchTerm,
  setSearchTerm,
  activeFilters,
  setActiveFilters,
  evolutionOnly,
  setEvolutionOnly,
  heldByPokemon,
  setHeldByPokemon,
  removeFilter,
  clearAll,
  sortBy,
  setSortBy,
}: Props) {
  const togglePocket = (v: string) =>
    setActiveFilters((prev) => ({
      ...prev,
      pockets: prev.pockets.includes(v)
        ? prev.pockets.filter((x) => x !== v)
        : [...prev.pockets, v],
    }));

  const toggleMethod = (v: string) =>
    setActiveFilters((prev) => ({
      ...prev,
      methods: prev.methods.includes(v)
        ? prev.methods.filter((x) => x !== v)
        : [...prev.methods, v],
    }));

  const hasAnyFilter =
    searchTerm || activeFilters.pockets.length > 0 || activeFilters.methods.length > 0 || evolutionOnly || heldByPokemon;
  const pocketLabel = (v: string) => POCKET_OPTIONS.find((o) => o.value === v)?.label ?? v;
  const methodLabel = (v: string) => METHOD_OPTIONS.find((o) => o.value === v)?.label ?? v;

  return (
    <div className="items-filter-bar">
      <div className="filter-bar__controls">
        <input
          className="items-search-input"
          type="text"
          placeholder="Search items…"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
        <MultiSelectDropdown
          label="Bag Pocket"
          options={POCKET_OPTIONS}
          selected={activeFilters.pockets}
          onToggle={togglePocket}
          optionClass={(v) => `color--pocket-${v}`}
          renderIcon={(opt) => <PocketCircle pocket={opt.value} size={18} />}
        />
        <MultiSelectDropdown
          label="Method"
          options={METHOD_OPTIONS}
          selected={activeFilters.methods}
          onToggle={toggleMethod}
          optionClass={(v) => `color--method-${v.replace(/_/g, '-')}`}
          renderIcon={(opt) => <MethodCircle method={opt.value} size={18} />}
        />
        <SortDropdown value={sortBy} onChange={setSortBy} />
        <label className="obtainable-toggle">
          <input
            type="checkbox"
            checked={evolutionOnly}
            onChange={(e) => setEvolutionOnly(e.target.checked)}
          />
          Evolution items
        </label>
        <label className="obtainable-toggle">
          <input
            type="checkbox"
            checked={heldByPokemon}
            onChange={(e) => setHeldByPokemon(e.target.checked)}
          />
          Held by Pokémon
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
          {activeFilters.pockets.map((v) => (
            <FilterPill
              key={v}
              label={pocketLabel(v)}
              colorClass={`color--pocket-${v}`}
              onRemove={() => removeFilter('pockets', v)}
            />
          ))}
          {activeFilters.methods.map((v) => (
            <FilterPill
              key={v}
              label={methodLabel(v)}
              colorClass={`color--method-${v.replace(/_/g, '-')}`}
              onRemove={() => removeFilter('methods', v)}
            />
          ))}
          {evolutionOnly && (
            <FilterPill label="Evolution items" colorClass="color--evolution" onRemove={() => setEvolutionOnly(false)} />
          )}
          {heldByPokemon && (
            <FilterPill label="Held by Pokémon" onRemove={() => setHeldByPokemon(false)} />
          )}
        </div>
      )}
    </div>
  );
}
