/* eslint-disable react-refresh/only-export-components */
/* eslint-disable @typescript-eslint/no-explicit-any */
import { useRef, useState, useEffect } from 'react';
import type { ActiveFilters, SortOption } from '../../ItemsPage';
import { SORT_OPTIONS } from '../../ItemsPage';
import './styles.scss';

// ── Config ────────────────────────────────────────────────────────────────────

export const POCKET_OPTIONS = [
  { value: 'items', label: 'Items' },
  { value: 'balls', label: 'Balls' },
  { value: 'tms', label: 'TMs & HMs' },
  { value: 'berries', label: 'Berries' },
  { value: 'key-items', label: 'Key Items' },
];

export const METHOD_OPTIONS = [
  { value: 'overworld', label: 'Overworld', icon: '🌿' },
  { value: 'hidden', label: 'Hidden', icon: '🔍' },
  { value: 'mart', label: 'Mart', icon: '🛒' },
  { value: 'npc', label: 'NPC Gift', icon: '🎁' },
  { value: 'berry_tree', label: 'Berry Tree', icon: '🍒' },
];

export const METHOD_COLORS: Record<string, string> = {
  overworld: '#3baf6a',
  hidden: '#8a63d2',
  mart: '#d4862f',
  npc: '#3a9bd4',
  berry_tree: '#d43a6e',
};

export const POCKET_COLOR = '#6b7af5';

// ── Dropdown ──────────────────────────────────────────────────────────────────

interface DropdownProps {
  label: string;
  options: { value: string; label: string; icon?: string }[];
  selected: string[];
  onToggle: (value: string) => void;
  pillColor?: (value: string) => string;
}

function MultiSelectDropdown({ label, options, selected, onToggle, pillColor }: DropdownProps) {
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
            const color = pillColor?.(opt.value);
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

// ── FilterBar ─────────────────────────────────────────────────────────────────

interface Props {
  searchTerm: string;
  setSearchTerm: (v: string) => void;
  activeFilters: ActiveFilters;
  setActiveFilters: React.Dispatch<React.SetStateAction<ActiveFilters>>;
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
    searchTerm || activeFilters.pockets.length > 0 || activeFilters.methods.length > 0;
  const pocketLabel = (v: string) => POCKET_OPTIONS.find((o) => o.value === v)?.label ?? v;
  const methodOpt = (v: string) => METHOD_OPTIONS.find((o) => o.value === v);

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
          pillColor={() => POCKET_COLOR}
        />
        <MultiSelectDropdown
          label="Method"
          options={METHOD_OPTIONS}
          selected={activeFilters.methods}
          onToggle={toggleMethod}
          pillColor={(v) => METHOD_COLORS[v] ?? '#7a8a9a'}
        />
        <SortDropdown value={sortBy} onChange={setSortBy} />
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
              color={POCKET_COLOR}
              onRemove={() => removeFilter('pockets', v)}
            />
          ))}
          {activeFilters.methods.map((v) => {
            const opt = methodOpt(v);
            return (
              <FilterPill
                key={v}
                label={opt ? `${opt.icon} ${opt.label}` : v}
                color={METHOD_COLORS[v]}
                onRemove={() => removeFilter('methods', v)}
              />
            );
          })}
        </div>
      )}
    </div>
  );
}
