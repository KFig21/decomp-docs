/* eslint-disable @typescript-eslint/no-explicit-any */
import { useRef, useState, useEffect } from 'react';
import type { TrainerActiveFilters, TrainerSortOption } from '../../TrainersPage';
import { TRAINER_SORT_OPTIONS } from '../../TrainersPage';
import {
  THREAT_MOVE_OPTIONS,
  THREAT_MOVE_COLOR,
  THREAT_MOVE_ALL,
} from '../../../../constants/threatMoves';
import './styles.scss';

export const BATTLE_TYPE_OPTIONS = [
  { value: 'single', label: 'Single Battle' },
  { value: 'double', label: 'Double Battle' },
];

export { THREAT_MOVE_OPTIONS, THREAT_MOVE_COLOR };

export const CLASS_COLOR = '#6b7af5';
export const BATTLE_TYPE_COLOR = '#d4862f';

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
    setActiveFilters((prev) => {
      if (v === THREAT_MOVE_ALL) {
        return {
          ...prev,
          threatMoves: prev.threatMoves.includes(THREAT_MOVE_ALL) ? [] : [THREAT_MOVE_ALL],
        };
      }
      const withoutAll = prev.threatMoves.filter((x) => x !== THREAT_MOVE_ALL);
      return {
        ...prev,
        threatMoves: withoutAll.includes(v)
          ? withoutAll.filter((x) => x !== v)
          : [...withoutAll, v],
      };
    });

  const hasAnyFilter =
    searchTerm ||
    activeFilters.classes.length > 0 ||
    activeFilters.battleTypes.length > 0 ||
    activeFilters.threatMoves.length > 0;

  const battleTypeLabel = (v: string) =>
    BATTLE_TYPE_OPTIONS.find((o) => o.value === v)?.label ?? v;

  const threatMoveLabel = (v: string) =>
    v === THREAT_MOVE_ALL
      ? 'Any Threat Move'
      : (THREAT_MOVE_OPTIONS.find((o) => o.value === v)?.label ?? v);

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
          options={[
            { value: THREAT_MOVE_ALL, label: 'Show All' },
            ...THREAT_MOVE_OPTIONS,
          ]}
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
