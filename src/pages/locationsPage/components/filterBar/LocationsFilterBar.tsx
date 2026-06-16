/* eslint-disable react-refresh/only-export-components */
/* eslint-disable @typescript-eslint/no-explicit-any */
import { useRef, useState, useEffect } from 'react';
import type { LocationFilters } from '../../LocationsPage';
import './styles.scss';

// ── Config ────────────────────────────────────────────────────────────────────

export const FEATURE_OPTIONS = [
  { value: 'trainers', label: 'Trainers', icon: '👤' },
  { value: 'rivals', label: 'Rivals', icon: '🏆' },
  { value: 'gym', label: 'Gym', icon: '🎖️' },
  { value: 'mart', label: 'Mart', icon: '🛒' },
  { value: 'wild', label: 'Wild Pokémon', icon: '🌿' },
  { value: 'items', label: 'Items', icon: '📦' },
];

export const FIELD_MOVE_OPTIONS = [
  { value: 'cut', label: 'Cut', icon: '🌿' },
  { value: 'surf', label: 'Surf', icon: '🌊' },
  { value: 'waterfall', label: 'Waterfall', icon: '💧' },
  { value: 'strength', label: 'Strength', icon: '🪨' },
  { value: 'flash', label: 'Flash', icon: '🔦' },
  { value: 'dive', label: 'Dive', icon: '🐠' },
  { value: 'rock_smash', label: 'Rock Smash', icon: '💥' },
];

// Shown when no weather values have been parsed from the data yet
export const FALLBACK_WEATHER_OPTIONS = [
  { value: 'Rain', label: 'Rain' },
  { value: 'Thunderstorm', label: 'Thunderstorm' },
  { value: 'Sandstorm', label: 'Sandstorm' },
  { value: 'Snow', label: 'Snow' },
  { value: 'Fog', label: 'Fog' },
  { value: 'Dense Fog', label: 'Dense Fog' },
  { value: 'Volcanic Ash', label: 'Volcanic Ash' },
  { value: 'Dark Clouds', label: 'Dark Clouds' },
  { value: 'Dark Thunderstorm', label: 'Dark Thunderstorm' },
  { value: 'Underwater', label: 'Underwater' },
  { value: 'Abnormal', label: 'Abnormal' },
];

const FEATURE_COLORS: Record<string, string> = {
  trainers: '#5b8ef5',
  rivals: '#e05c5c',
  gym: '#e8a43a',
  mart: '#3baf6a',
  wild: '#58a87a',
  items: '#9c6ee8',
};

const FIELD_MOVE_COLORS: Record<string, string> = {
  cut: '#58a87a',
  surf: '#3a9bd4',
  waterfall: '#5bc4e8',
  strength: '#c87a3a',
  flash: '#e8d43a',
  dive: '#3a6ae8',
  rock_smash: '#c87a3a',
};

// ── MultiSelectDropdown ────────────────────────────────────────────────────────

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

// ── FilterPill ─────────────────────────────────────────────────────────────────

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

// ── LocationsFilterBar ─────────────────────────────────────────────────────────

interface Props {
  searchTerm: string;
  setSearchTerm: (v: string) => void;
  filters: LocationFilters;
  setFilters: React.Dispatch<React.SetStateAction<LocationFilters>>;
  removeFilter: (cat: keyof LocationFilters, value: string) => void;
  clearAll: () => void;
  encounterMethodOptions: string[];
  weatherOptions: string[];
}

export default function LocationsFilterBar({
  searchTerm,
  setSearchTerm,
  filters,
  setFilters,
  removeFilter,
  clearAll,
  encounterMethodOptions,
  weatherOptions,
}: Props) {
  const toggle = (cat: keyof LocationFilters) => (v: string) =>
    setFilters((prev) => ({
      ...prev,
      [cat]: (prev[cat] as string[]).includes(v)
        ? (prev[cat] as string[]).filter((x) => x !== v)
        : [...(prev[cat] as string[]), v],
    }));

  const hasAnyFilter =
    searchTerm ||
    filters.features.length > 0 ||
    filters.encounterMethods.length > 0 ||
    filters.weather.length > 0 ||
    filters.hmEvents.length > 0;

  const encMethodOpts = encounterMethodOptions.map((m) => ({ value: m, label: m }));
  const weatherOpts = weatherOptions.map((w) => ({ value: w, label: w }));

  return (
    <div className="locations-filter-bar">
      <div className="filter-bar__controls">
        <input
          className="locations-search-input"
          type="text"
          placeholder="Search locations…"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
        <MultiSelectDropdown
          label="Features"
          options={FEATURE_OPTIONS}
          selected={filters.features}
          onToggle={toggle('features')}
          pillColor={(v) => FEATURE_COLORS[v] ?? '#7a8a9a'}
        />
        {encMethodOpts.length > 0 && (
          <MultiSelectDropdown
            label="Encounters"
            options={encMethodOpts}
            selected={filters.encounterMethods}
            onToggle={toggle('encounterMethods')}
            pillColor={() => '#58a87a'}
          />
        )}
        <MultiSelectDropdown
          label="Weather"
          options={weatherOpts.length > 0 ? weatherOpts : FALLBACK_WEATHER_OPTIONS}
          selected={filters.weather}
          onToggle={toggle('weather')}
          pillColor={() => '#5bc4e8'}
        />
        <MultiSelectDropdown
          label="Field Moves"
          options={FIELD_MOVE_OPTIONS}
          selected={filters.hmEvents}
          onToggle={toggle('hmEvents')}
          pillColor={(v) => FIELD_MOVE_COLORS[v] ?? '#7a8a9a'}
        />
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
          {filters.features.map((v) => {
            const opt = FEATURE_OPTIONS.find((o) => o.value === v);
            return (
              <FilterPill
                key={v}
                label={opt ? `${opt.icon} ${opt.label}` : v}
                color={FEATURE_COLORS[v]}
                onRemove={() => removeFilter('features', v)}
              />
            );
          })}
          {filters.encounterMethods.map((v) => (
            <FilterPill
              key={v}
              label={v}
              color="#58a87a"
              onRemove={() => removeFilter('encounterMethods', v)}
            />
          ))}
          {filters.weather.map((v) => (
            <FilterPill
              key={v}
              label={v}
              color="#5bc4e8"
              onRemove={() => removeFilter('weather', v)}
            />
          ))}
          {filters.hmEvents.map((v) => {
            const opt = FIELD_MOVE_OPTIONS.find((o) => o.value === v);
            return (
              <FilterPill
                key={v}
                label={opt ? `${opt.icon} ${opt.label}` : v}
                color={FIELD_MOVE_COLORS[v]}
                onRemove={() => removeFilter('hmEvents', v)}
              />
            );
          })}
        </div>
      )}
    </div>
  );
}
