/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable react-refresh/only-export-components */
import { useRef, useState, useEffect } from 'react';
import type { PokemonActiveFilters } from '../../PokemonPage';
import './styles.scss';

// ── Data ──────────────────────────────────────────────────────────────────────

const SORT_OPTIONS = [
  { value: 'pokedex', label: 'Pokédex #' },
  { value: 'alpha', label: 'A → Z' },
  { value: 'bst', label: 'BST (High → Low)' },
  { value: 'type', label: 'Primary Type' },
];

export const TYPE_OPTIONS = [
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

export const ENCOUNTER_OPTIONS = [
  { value: 'Land', label: 'Tall Grass', icon: '🌿' },
  { value: 'Surfing', label: 'Surfing', icon: '🌊' },
  { value: 'Rock Smash', label: 'Rock Smash', icon: '🪨' },
  { value: 'Old Rod', label: 'Old Rod', icon: '🎣' },
  { value: 'Good Rod', label: 'Good Rod', icon: '🎣' },
  { value: 'Super Rod', label: 'Super Rod', icon: '🎣' },
  { value: 'Static', label: 'Static / Gift', icon: '⭐' },
];

// Type colours for pills/badges
export const TYPE_COLORS: Record<string, string> = {
  normal: '#a8a878',
  fire: '#f08030',
  water: '#6890f0',
  electric: '#f8d030',
  grass: '#78c850',
  ice: '#98d8d8',
  fighting: '#c03028',
  poison: '#a040a0',
  ground: '#e0c068',
  flying: '#a890f0',
  psychic: '#f85888',
  bug: '#a8b820',
  rock: '#b8a038',
  ghost: '#705898',
  dragon: '#7038f8',
  dark: '#705848',
  steel: '#b8b8d0',
  fairy: '#ee99ac',
};

const ENCOUNTER_COLOR = '#3a9bd4';
const TYPE1_COLOR = '#e67e22';
const TYPE2_COLOR = '#8e44ad';

// ── Shared dropdown ───────────────────────────────────────────────────────────

interface MultiDropdownProps {
  label: string;
  options: { value: string; label: string; icon?: string; color?: string }[];
  selected: string[];
  onToggle: (v: string) => void;
  accentColor?: string;
}

function MultiDropdown({ label, options, selected, onToggle, accentColor }: MultiDropdownProps) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const h = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener('mousedown', h);
    return () => document.removeEventListener('mousedown', h);
  }, []);

  return (
    <div className={`ms-dropdown ${open ? 'ms-dropdown--open' : ''}`} ref={ref}>
      <button
        className={`ms-dropdown__trigger ${selected.length > 0 ? 'ms-dropdown__trigger--active' : ''}`}
        style={
          selected.length > 0 && accentColor ? ({ '--trigger-color': accentColor } as any) : {}
        }
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
            const color = opt.color ?? accentColor;
            return (
              <button
                key={opt.value}
                className={`ms-dropdown__option ${isSelected ? 'ms-dropdown__option--selected' : ''}`}
                style={isSelected && color ? ({ '--opt-color': color } as any) : {}}
                onClick={() => onToggle(opt.value)}
              >
                <span className="ms-dropdown__checkbox">{isSelected ? '✓' : ''}</span>
                {opt.icon && <span className="ms-dropdown__icon">{opt.icon}</span>}
                <span>{opt.label}</span>
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}

// Single-select sort dropdown
function SortDropdown({ value, onChange }: { value: string; onChange: (v: string) => void }) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const h = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener('mousedown', h);
    return () => document.removeEventListener('mousedown', h);
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

// Filter pill
function FilterPill({
  label,
  color,
  onRemove,
}: {
  label: string;
  color?: string;
  onRemove: () => void;
}) {
  return (
    <span className="active-pill" style={color ? ({ '--pill-color': color } as any) : {}}>
      {label}
      <button className="active-pill__close" onClick={onRemove}>
        ×
      </button>
    </span>
  );
}

// ── PokemonFilterBar ──────────────────────────────────────────────────────────

interface Props {
  searchTerm: string;
  setSearchTerm: (v: string) => void;
  showObtainableOnly: boolean;
  setShowObtainableOnly: (v: boolean) => void;
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
}

export default function PokemonFilterBar({
  searchTerm,
  setSearchTerm,
  showObtainableOnly,
  setShowObtainableOnly,
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
}: Props) {
  const toggle = (cat: keyof PokemonActiveFilters) => (v: string) =>
    setActiveFilters((prev) => ({
      ...prev,
      [cat]: prev[cat].includes(v) ? prev[cat].filter((x) => x !== v) : [...prev[cat], v],
    }));

  const typeOptions = TYPE_OPTIONS.map((t) => ({
    value: t,
    label: t,
    color: TYPE_COLORS[t.toLowerCase()],
  }));

  const encounterOptions = ENCOUNTER_OPTIONS.map((e) => ({ ...e, color: ENCOUNTER_COLOR }));

  const hasAnyFilter =
    searchTerm ||
    showObtainableOnly ||
    activeFilters.types1.length > 0 ||
    activeFilters.types2.length > 0 ||
    activeFilters.encounters.length > 0 ||
    minBst ||
    maxBst ||
    moveFilter ||
    sortBy !== 'pokedex';

  return (
    <div className="pokemon-filter-bar">
      {/* ── Controls row ── */}
      <div className="filter-bar__controls">
        <input
          className="items-search-input"
          type="text"
          placeholder="Search Pokémon…"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />

        <MultiDropdown
          label="Type 1"
          options={typeOptions}
          selected={activeFilters.types1}
          onToggle={toggle('types1')}
          accentColor={TYPE1_COLOR}
        />

        <MultiDropdown
          label="Type 2"
          options={typeOptions}
          selected={activeFilters.types2}
          onToggle={toggle('types2')}
          accentColor={TYPE2_COLOR}
        />

        <MultiDropdown
          label="Encounter"
          options={encounterOptions}
          selected={activeFilters.encounters}
          onToggle={toggle('encounters')}
          accentColor={ENCOUNTER_COLOR}
        />

        <SortDropdown value={sortBy} onChange={setSortBy} />

        {/* BST range */}
        <div className="bst-range">
          <span className="bst-range__label">BST</span>
          <input
            type="number"
            placeholder="Min"
            value={minBst}
            onChange={(e) => setMinBst(e.target.value)}
            className="bst-range__input"
          />
          <span className="bst-range__sep">–</span>
          <input
            type="number"
            placeholder="Max"
            value={maxBst}
            onChange={(e) => setMaxBst(e.target.value)}
            className="bst-range__input"
          />
        </div>

        {/* Move search */}
        <input
          className="items-search-input items-search-input--move"
          type="text"
          placeholder="Learnable move…"
          value={moveFilter}
          onChange={(e) => setMoveFilter(e.target.value)}
        />

        {/* Obtainable toggle */}
        <label className="obtainable-toggle">
          <input
            type="checkbox"
            checked={showObtainableOnly}
            onChange={(e) => setShowObtainableOnly(e.target.checked)}
          />
          Obtainable only
        </label>
      </div>

      {/* ── Active pills ── */}
      {hasAnyFilter && (
        <div className="filter-bar__pills">
          {hasAnyFilter && (
            <button className="filter-clear-all" onClick={clearAll}>
              Clear all
            </button>
          )}
          {searchTerm && (
            <FilterPill label={`"${searchTerm}"`} onRemove={() => setSearchTerm('')} />
          )}
          {showObtainableOnly && (
            <FilterPill label="Obtainable only" onRemove={() => setShowObtainableOnly(false)} />
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
          {sortBy !== 'pokedex' && (
            <FilterPill
              label={`Sort: ${SORT_OPTIONS.find((o) => o.value === sortBy)?.label}`}
              onRemove={() => setSortBy('pokedex')}
            />
          )}
        </div>
      )}
    </div>
  );
}
