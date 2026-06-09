/* eslint-disable @typescript-eslint/no-explicit-any */
import { useRef, useState, useEffect } from 'react';
import type { TrainerActiveFilters, TrainerSortOption } from '../../TrainersPage';
import { TRAINER_SORT_OPTIONS } from '../../TrainersPage';
import './styles.scss';

export const BATTLE_TYPE_OPTIONS = [
  { value: 'single', label: 'Single Battle' },
  { value: 'double', label: 'Double Battle' },
];

// Normalized value = move name lowercased with spaces/hyphens removed
export const THREAT_MOVE_OPTIONS = [
  { value: 'metronome', label: 'Metronome' },
  { value: 'perishsong', label: 'Perish Song' },
  { value: 'destinybond', label: 'Destiny Bond' },
  { value: 'selfdestruct', label: 'Self-Destruct' },
  { value: 'explosion', label: 'Explosion' },
  { value: 'counter', label: 'Counter' },
  { value: 'mirrorcoat', label: 'Mirror Coat' },
  { value: 'fissure', label: 'Fissure' },
  { value: 'sheercold', label: 'Sheer Cold' },
  { value: 'guillotine', label: 'Guillotine' },
  { value: 'horndrill', label: 'Horn Drill' },
];

export const CLASS_COLOR = '#6b7af5';
export const BATTLE_TYPE_COLOR = '#d4862f';
export const THREAT_MOVE_COLOR = '#c0392b';

// ── Multi-select dropdown ──────────────────────────────────────────────────────

interface DropdownProps {
  label: string;
  options: { value: string; label: string }[];
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
                <span>{opt.label}</span>
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}

// ── Sort dropdown (single-select) ──────────────────────────────────────────────

interface SortDropdownProps {
  value: TrainerSortOption;
  onChange: (v: TrainerSortOption) => void;
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

  const currentLabel = TRAINER_SORT_OPTIONS.find((o) => o.value === value)?.label ?? 'Sort';

  return (
    <div className={`ms-dropdown ms-dropdown--sort ${open ? 'ms-dropdown--open' : ''}`} ref={ref}>
      <button className="ms-dropdown__trigger" onClick={() => setOpen((v) => !v)}>
        <span>↕ {currentLabel}</span>
        <span className="ms-dropdown__chevron">{open ? '▲' : '▼'}</span>
      </button>
      {open && (
        <div className="ms-dropdown__menu">
          {TRAINER_SORT_OPTIONS.map((opt) => (
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

// ── Filter pill ────────────────────────────────────────────────────────────────

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

// ── TrainerFilterBar ───────────────────────────────────────────────────────────

interface Props {
  searchTerm: string;
  setSearchTerm: (v: string) => void;
  activeFilters: TrainerActiveFilters;
  setActiveFilters: React.Dispatch<React.SetStateAction<TrainerActiveFilters>>;
  allClasses: string[];
  sortBy: TrainerSortOption;
  setSortBy: (v: TrainerSortOption) => void;
  removeFilter: (cat: keyof TrainerActiveFilters, value: string) => void;
  clearAll: () => void;
}

export default function TrainerFilterBar({
  searchTerm,
  setSearchTerm,
  activeFilters,
  setActiveFilters,
  allClasses,
  sortBy,
  setSortBy,
  removeFilter,
  clearAll,
}: Props) {
  const toggleClass = (v: string) =>
    setActiveFilters((prev) => ({
      ...prev,
      classes: prev.classes.includes(v) ? prev.classes.filter((x) => x !== v) : [...prev.classes, v],
    }));

  const toggleBattleType = (v: string) =>
    setActiveFilters((prev) => ({
      ...prev,
      battleTypes: prev.battleTypes.includes(v)
        ? prev.battleTypes.filter((x) => x !== v)
        : [...prev.battleTypes, v],
    }));

  const classOptions = allClasses.map((c) => ({ value: c, label: c }));

  const toggleThreatMove = (v: string) =>
    setActiveFilters((prev) => ({
      ...prev,
      threatMoves: prev.threatMoves.includes(v)
        ? prev.threatMoves.filter((x) => x !== v)
        : [...prev.threatMoves, v],
    }));

  const hasAnyFilter =
    searchTerm ||
    activeFilters.classes.length > 0 ||
    activeFilters.battleTypes.length > 0 ||
    activeFilters.threatMoves.length > 0;

  const battleTypeLabel = (v: string) =>
    BATTLE_TYPE_OPTIONS.find((o) => o.value === v)?.label ?? v;

  const threatMoveLabel = (v: string) =>
    THREAT_MOVE_OPTIONS.find((o) => o.value === v)?.label ?? v;

  return (
    <div className="trainers-filter-bar">
      <div className="filter-bar__controls">
        <input
          className="trainers-search-input"
          type="text"
          placeholder="Search trainers…"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
        <MultiSelectDropdown
          label="Trainer Class"
          options={classOptions}
          selected={activeFilters.classes}
          onToggle={toggleClass}
          pillColor={() => CLASS_COLOR}
        />
        <MultiSelectDropdown
          label="Battle Type"
          options={BATTLE_TYPE_OPTIONS}
          selected={activeFilters.battleTypes}
          onToggle={toggleBattleType}
          pillColor={() => BATTLE_TYPE_COLOR}
        />
        <MultiSelectDropdown
          label="Threat Moves"
          options={THREAT_MOVE_OPTIONS}
          selected={activeFilters.threatMoves}
          onToggle={toggleThreatMove}
          pillColor={() => THREAT_MOVE_COLOR}
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
          {activeFilters.classes.map((v) => (
            <FilterPill
              key={v}
              label={v}
              color={CLASS_COLOR}
              onRemove={() => removeFilter('classes', v)}
            />
          ))}
          {activeFilters.battleTypes.map((v) => (
            <FilterPill
              key={v}
              label={battleTypeLabel(v)}
              color={BATTLE_TYPE_COLOR}
              onRemove={() => removeFilter('battleTypes', v)}
            />
          ))}
          {activeFilters.threatMoves.map((v) => (
            <FilterPill
              key={v}
              label={threatMoveLabel(v)}
              color={THREAT_MOVE_COLOR}
              onRemove={() => removeFilter('threatMoves', v)}
            />
          ))}
        </div>
      )}
    </div>
  );
}
