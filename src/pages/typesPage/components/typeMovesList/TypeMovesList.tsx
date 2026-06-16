/* eslint-disable @typescript-eslint/no-explicit-any */
import { useState, useMemo, useRef, useEffect } from 'react';
import { Link } from 'react-router-dom';
import CategoryBadge from '../../../../components/elements/categoryBadge/CategoryBadge';
import { normalizeCategory, CategoryIcon } from '../../../../components/elements/categoryBadge/CategoryBadge';
import CollapseToggle from '../../../../components/elements/collapseToggle/CollapseToggle';
import { useData } from '../../../../contexts/dataContext';
import './styles.scss';

type Props = {
  moves: any[];
  unreleasedKeys?: Set<string>;
};

type SortCol = 'name' | 'category' | 'power' | 'accuracy' | 'pp';
type SortDir = 'asc' | 'desc';

// ── Filter helpers ────────────────────────────────────────────────────────────

const CATEGORY_OPTIONS = ['physical', 'special', 'status'] as const;
const CATEGORY_LABELS: Record<string, string> = {
  physical: 'Physical',
  special: 'Special',
  status: 'Status',
};
const CATEGORY_COLORS: Record<string, string> = {
  physical: '#c03028',
  special: '#6890f0',
  status: '#a040a0',
};

const POWER_OPTIONS = [
  { label: 'Any', value: 0 },
  { label: '10+', value: 10 },
  { label: '20+', value: 20 },
  { label: '40+', value: 40 },
  { label: '60+', value: 60 },
  { label: '80+', value: 80 },
  { label: '100+', value: 100 },
];

const PP_OPTIONS = [
  { label: 'Any', value: 0 },
  { label: '5+', value: 5 },
  { label: '10+', value: 10 },
  { label: '15+', value: 15 },
  { label: '20+', value: 20 },
  { label: '25+', value: 25 },
];

// Single-select threshold dropdown
function ThresholdDropdown({
  label,
  options,
  value,
  onChange,
}: {
  label: string;
  options: { label: string; value: number }[];
  value: number;
  onChange: (v: number) => void;
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

  const selected = options.find((o) => o.value === value);
  const isActive = value > 0;

  return (
    <div className={`ms-dropdown ms-dropdown--sort ${open ? 'ms-dropdown--open' : ''}`} ref={ref}>
      <button
        className={`ms-dropdown__trigger ${isActive ? 'ms-dropdown__trigger--active' : ''}`}
        onClick={() => setOpen((v) => !v)}
      >
        <span>{label}{isActive ? `: ${selected?.label}` : ''}</span>
        <span className="ms-dropdown__chevron">{open ? '▲' : '▼'}</span>
      </button>
      {open && (
        <div className="ms-dropdown__menu">
          {options.map((opt) => (
            <button
              key={opt.value}
              className={`ms-dropdown__option ${value === opt.value ? 'ms-dropdown__option--selected' : ''}`}
              onClick={() => { onChange(opt.value); setOpen(false); }}
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

// Multi-select category dropdown
function CategoryDropdown({
  selected,
  onToggle,
}: {
  selected: string[];
  onToggle: (v: string) => void;
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

  const isActive = selected.length > 0;

  return (
    <div className={`ms-dropdown ${open ? 'ms-dropdown--open' : ''}`} ref={ref}>
      <button
        className={`ms-dropdown__trigger ${isActive ? 'ms-dropdown__trigger--active' : ''}`}
        style={isActive ? ({ '--trigger-color': '#c03028' } as React.CSSProperties) : {}}
        onClick={() => setOpen((v) => !v)}
      >
        <span>Category</span>
        {isActive && <span className="ms-dropdown__count">{selected.length}</span>}
        <span className="ms-dropdown__chevron">{open ? '▲' : '▼'}</span>
      </button>
      {open && (
        <div className="ms-dropdown__menu">
          {CATEGORY_OPTIONS.map((cat) => {
            const isChecked = selected.includes(cat);
            return (
              <button
                key={cat}
                className={`ms-dropdown__option ${isChecked ? 'ms-dropdown__option--selected' : ''}`}
                onClick={() => onToggle(cat)}
              >
                <span className="ms-dropdown__checkbox">{isChecked ? '✓' : ''}</span>
                <CategoryIcon raw={cat} size={13} />
                <span style={{ color: CATEGORY_COLORS[cat] }}>{CATEGORY_LABELS[cat]}</span>
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}

// ── TM label helper ───────────────────────────────────────────────────────────

function getTmLabel(item: any): string {
  const prefix = item.key?.startsWith('ITEM_HM') ? 'HM' : 'TM';
  const keyNum = item.key?.match(/ITEM_(?:TM|HM)(\d+)/)?.[1];
  const nameNum = item.name?.match(/^(?:TM|HM)(\d+)$/i)?.[1];
  const rawNum = keyNum ?? nameNum;
  const num = rawNum ? String(Number(rawNum)).padStart(2, '0') : '';
  return num ? `${prefix}${num}` : prefix;
}

const formatStat = (v: number | undefined) => (!v || v === 0 ? '—' : v);

// ── Main component ────────────────────────────────────────────────────────────

export default function TypeMovesList({ moves, unreleasedKeys }: Props) {
  const { items } = useData();
  const [isOpen, setIsOpen] = useState(true);
  const [sortCol, setSortCol] = useState<SortCol>('name');
  const [sortDir, setSortDir] = useState<SortDir>('asc');

  // Filters
  const [categories, setCategories] = useState<string[]>([]);
  const [fullyAccurate, setFullyAccurate] = useState(false);
  const [minPower, setMinPower] = useState(0);
  const [minPp, setMinPp] = useState(0);

  const hasFilters = categories.length > 0 || fullyAccurate || minPower > 0 || minPp > 0;

  const clearFilters = () => {
    setCategories([]);
    setFullyAccurate(false);
    setMinPower(0);
    setMinPp(0);
  };

  const toggleCategory = (cat: string) =>
    setCategories((prev) => prev.includes(cat) ? prev.filter((c) => c !== cat) : [...prev, cat]);

  const tmByMove = useMemo(() => {
    const map: Record<string, any> = {};
    for (const item of Object.values(items || {}) as any[]) {
      if (!item.key?.startsWith('ITEM_TM') && !item.key?.startsWith('ITEM_HM')) continue;
      const moveKey = 'MOVE_' + item.key.replace(/^ITEM_(TM\d+_|HM\d+_|TM_|HM_)/, '');
      if (!map[moveKey]) map[moveKey] = item;
    }
    return map;
  }, [items]);

  const filtered = useMemo(() => {
    return moves.filter((move: any) => {
      if (categories.length > 0) {
        const cat = normalizeCategory(move.category || move.split);
        if (!categories.includes(cat)) return false;
      }
      if (fullyAccurate) {
        // 0 = always hits, 100 = fully accurate
        if (!(move.accuracy === 0 || move.accuracy >= 100)) return false;
      }
      if (minPower > 0 && (move.power ?? 0) < minPower) return false;
      if (minPp > 0 && (move.pp ?? 0) < minPp) return false;
      return true;
    });
  }, [moves, categories, fullyAccurate, minPower, minPp]);

  const sorted = useMemo(() => {
    const arr = [...filtered];
    const dir = sortDir === 'asc' ? 1 : -1;
    arr.sort((a, b) => {
      switch (sortCol) {
        case 'name':     return dir * (a.name ?? '').localeCompare(b.name ?? '');
        case 'category': return dir * normalizeCategory(a.category || a.split).localeCompare(normalizeCategory(b.category || b.split));
        case 'power':    return dir * ((a.power ?? 0) - (b.power ?? 0));
        case 'accuracy': return dir * ((a.accuracy ?? 0) - (b.accuracy ?? 0));
        case 'pp':       return dir * ((a.pp ?? 0) - (b.pp ?? 0));
        default:         return 0;
      }
    });
    return arr;
  }, [filtered, sortCol, sortDir]);

  const handleSort = (col: SortCol) => {
    if (col === sortCol) setSortDir(d => d === 'asc' ? 'desc' : 'asc');
    else { setSortCol(col); setSortDir('asc'); }
  };

  const sortIndicator = (col: SortCol) => {
    if (col !== sortCol) return ' ↕';
    return sortDir === 'asc' ? ' ↑' : ' ↓';
  };

  return (
    <section className={`type-card-style ${isOpen ? '' : 'collapsed'}`}>
      <div className="section-header" onClick={() => setIsOpen(!isOpen)}>
        <CollapseToggle isOpen={isOpen} />
        Moves
        <span className="type-section__count">{sorted.length}{filtered.length !== moves.length ? ` / ${moves.length}` : ''}</span>
      </div>

      {isOpen && (
        <>
          <div className="type-moves-filters">
            <CategoryDropdown selected={categories} onToggle={toggleCategory} />

            <ThresholdDropdown
              label="Power"
              options={POWER_OPTIONS}
              value={minPower}
              onChange={setMinPower}
            />

            <ThresholdDropdown
              label="PP"
              options={PP_OPTIONS}
              value={minPp}
              onChange={setMinPp}
            />

            <label className="obtainable-toggle">
              <input
                type="checkbox"
                checked={fullyAccurate}
                onChange={(e) => setFullyAccurate(e.target.checked)}
              />
              Fully accurate
            </label>

            {hasFilters && (
              <button className="filter-clear-all" onClick={clearFilters}>
                Clear
              </button>
            )}
          </div>

          {sorted.length === 0 ? (
            <div className="content"><p className="type-section__empty">No moves match the current filters.</p></div>
          ) : (
            <div className="content" style={{ overflowX: 'auto' }}>
              <table className="type-moves-table">
                <thead>
                  <tr>
                    <th className="sortable" onClick={() => handleSort('name')}>Name{sortIndicator('name')}</th>
                    <th className="center col-cat sortable" onClick={() => handleSort('category')}>Category{sortIndicator('category')}</th>
                    <th className="center col-power sortable" onClick={() => handleSort('power')}>Power{sortIndicator('power')}</th>
                    <th className="center col-acc sortable" onClick={() => handleSort('accuracy')}>Accuracy{sortIndicator('accuracy')}</th>
                    <th className="center col-pp sortable" onClick={() => handleSort('pp')}>PP{sortIndicator('pp')}</th>
                    <th className="col-desc">Description</th>
                  </tr>
                </thead>
                <tbody>
                  {sorted.map((move: any) => {
                    const tmItem = tmByMove[move.key];
                    const isUnreleased = unreleasedKeys?.has(move.key);
                    return (
                      <tr key={move.key} className={isUnreleased ? 'row--unreleased' : ''}>
                        <td>
                          <div className="move-name-cell">
                            <Link to={`/moves/${move.key}`} className="learnset-link">
                              {move.name}
                            </Link>
                            {tmItem && (
                              <Link to={`/items/${tmItem.key}`} className="learnset-link learnset-link--tm">
                                {getTmLabel(tmItem)}
                              </Link>
                            )}
                          </div>
                        </td>
                        <td className="center">
                          <CategoryBadge raw={move.category || move.split} showIcon />
                        </td>
                        <td className="center">{formatStat(move.power)}</td>
                        <td className="center">{move.accuracy != null && move.accuracy > 0 ? `${move.accuracy}%` : '—'}</td>
                        <td className="center">{formatStat(move.pp)}</td>
                        <td className="col-desc">{move.description || '—'}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </>
      )}
    </section>
  );
}
