/* eslint-disable react-refresh/only-export-components */
/* eslint-disable @typescript-eslint/no-explicit-any */
import { useState, useMemo, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useData } from '../../contexts/dataContext';
import MoveSidebar from './components/moveSidebar/MoveSidebar';
import MoveFilterBar from './components/moveFilterBar/MoveFilterBar';
import MoveDetailPage from './MoveDetailPage';
import './styles.scss';

export type MoveActiveFilters = {
  types: string[];
  categories: string[];
  effects: string[];
};

export type MoveSortOption =
  | 'alpha-asc'
  | 'alpha-desc'
  | 'power-desc'
  | 'power-asc'
  | 'accuracy-desc'
  | 'accuracy-asc'
  | 'pp-desc'
  | 'pp-asc';

export const MOVE_SORT_OPTIONS: { value: MoveSortOption; label: string }[] = [
  { value: 'alpha-asc', label: 'A → Z' },
  { value: 'alpha-desc', label: 'Z → A' },
  { value: 'power-desc', label: 'Power: High → Low' },
  { value: 'power-asc', label: 'Power: Low → High' },
  { value: 'accuracy-desc', label: 'Accuracy: High → Low' },
  { value: 'accuracy-asc', label: 'Accuracy: Low → High' },
  { value: 'pp-desc', label: 'PP: High → Low' },
  { value: 'pp-asc', label: 'PP: Low → High' },
];

// ── Category normaliser (THE FIX) ─────────────────────────────────────────────
// The expansion uses DAMAGE_CATEGORY_STATUS / DAMAGE_CATEGORY_PHYSICAL / DAMAGE_CATEGORY_SPECIAL
// Vanilla uses SPLIT_STATUS / SPLIT_PHYSICAL / SPLIT_SPECIAL
// We strip the prefix entirely and match on the bare word.
export function normalizeMoveCategory(raw: string | undefined): 'Physical' | 'Special' | 'Status' {
  if (!raw) return 'Status';
  const bare = raw
    .toUpperCase()
    .replace(/^DAMAGE_CATEGORY_/, '')
    .replace(/^SPLIT_/, '')
    .trim();
  if (bare === 'PHYSICAL') return 'Physical';
  if (bare === 'SPECIAL') return 'Special';
  return 'Status';
}

// Converts TYPE_FIRE → Fire
export function normalizeTypeName(raw: string | undefined): string {
  if (!raw) return '';
  const bare = raw.replace(/^TYPE_/i, '');
  return bare.charAt(0).toUpperCase() + bare.slice(1).toLowerCase();
}

function applySort(moves: any[], sort: MoveSortOption): any[] {
  const arr = [...moves];
  switch (sort) {
    case 'alpha-asc':
      return arr.sort((a, b) => a.name.localeCompare(b.name));
    case 'alpha-desc':
      return arr.sort((a, b) => b.name.localeCompare(a.name));
    case 'power-desc':
      return arr.sort((a, b) => (b.power ?? 0) - (a.power ?? 0));
    case 'power-asc':
      return arr.sort((a, b) => (a.power ?? 0) - (b.power ?? 0));
    case 'accuracy-desc':
      return arr.sort((a, b) => (b.accuracy ?? 0) - (a.accuracy ?? 0));
    case 'accuracy-asc':
      return arr.sort((a, b) => (a.accuracy ?? 0) - (b.accuracy ?? 0));
    case 'pp-desc':
      return arr.sort((a, b) => (b.pp ?? 0) - (a.pp ?? 0));
    case 'pp-asc':
      return arr.sort((a, b) => (a.pp ?? 0) - (b.pp ?? 0));
    default:
      return arr;
  }
}

export default function MovesPage() {
  const { moves, items, pokemon } = useData();
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();

  const [searchTerm, setSearchTerm] = useState('');
  const [activeFilters, setActiveFilters] = useState<MoveActiveFilters>({
    types: [],
    categories: [],
    effects: [],
  });
  const [sortBy, setSortBy] = useState<MoveSortOption>('alpha-asc');
  const [hasTmOnly, setHasTmOnly] = useState(false);
  const [minPower, setMinPower] = useState('');
  const [maxPower, setMaxPower] = useState('');

  const movesArray = useMemo(() => Object.values(moves || {}), [moves]);
  const itemsArray = useMemo(() => Object.values(items || {}), [items]);
  const pokemonArray = useMemo(() => Object.values(pokemon || {}), [pokemon]);

  // Set of all move keys that at least one Pokémon can learn
  // (via level-up, TM/HM, or tutor — all stored in levelUpLearnset / tmhmLearnset)
  const learnableMoveKeys = useMemo(() => {
    const keys = new Set<string>();
    for (const mon of pokemonArray as any[]) {
      for (const e of mon.levelUpLearnset ?? []) {
        const k = typeof e.move === 'string' ? e.move : e.move?.key;
        if (k) keys.add(k);
      }
      for (const e of mon.tmhmLearnset ?? []) {
        const k = typeof e.move === 'string' ? e.move : e.move?.key;
        if (k) keys.add(k);
      }
    }
    return keys;
  }, [pokemonArray]);

  // TM item lookup: moveKey → TM item
  const tmByMove = useMemo(() => {
    const map: Record<string, any> = {};
    for (const item of itemsArray as any[]) {
      if (!item.key?.startsWith('ITEM_TM') && !item.key?.startsWith('ITEM_HM')) continue;
      const moveKey = 'MOVE_' + item.key.replace(/^ITEM_(TM\d+_|HM\d+_|TM_|HM_)/, '');
      if (moveKey in (moves || {})) map[moveKey] = item;
    }
    return map;
  }, [itemsArray, moves]);

  // Unique secondary effect labels for the Effect dropdown
  // Use additionalEffects[].label (human-readable) rather than raw EFFECT_ strings
  const allEffects = useMemo(() => {
    const set = new Set<string>();
    for (const m of movesArray as any[]) {
      if (m.additionalEffects) {
        for (const e of m.additionalEffects) {
          // Strip trailing " (N%)" so the filter label matches cleanly
          const bare = e.label.replace(/\s*\(\d+%\)$/, '').trim();
          if (bare) set.add(bare);
        }
      }
    }
    return Array.from(set).sort();
  }, [movesArray]);

  const filteredMoves = useMemo(() => {
    const filtered = (movesArray as any[]).filter((move) => {
      if (move.key === 'MOVE_NONE') return false;
      if (!move.name || move.name === '????' || move.name === 'None') return false;
      if (!learnableMoveKeys.has(move.key)) return false;

      if (searchTerm && !move.name.toLowerCase().includes(searchTerm.toLowerCase())) return false;

      // Type filter
      if (activeFilters.types.length > 0) {
        const moveType = normalizeTypeName(move.type).toLowerCase();
        if (!activeFilters.types.some((t) => t.toLowerCase() === moveType)) return false;
      }

      // Category filter — uses the fixed normaliser
      if (activeFilters.categories.length > 0) {
        const cat = normalizeMoveCategory(move.category || move.split);
        if (!activeFilters.categories.includes(cat)) return false;
      }

      // Effect filter — match against additionalEffects[].label
      if (activeFilters.effects.length > 0) {
        const effectLabels: string[] = (move.additionalEffects ?? []).map((e: any) =>
          e.label.replace(/\s*\(\d+%\)$/, '').trim(),
        );
        if (!activeFilters.effects.some((f) => effectLabels.includes(f))) return false;
      }

      if (hasTmOnly && !tmByMove[move.key]) return false;
      if (minPower && (move.power ?? 0) < Number(minPower)) return false;
      if (maxPower && (move.power ?? 0) > Number(maxPower)) return false;

      return true;
    });

    return applySort(filtered, sortBy);
  }, [movesArray, searchTerm, activeFilters, sortBy, hasTmOnly, tmByMove, minPower, maxPower, learnableMoveKeys]);

  useEffect(() => {
    if (!id && filteredMoves.length > 0) {
      navigate(`/moves/${filteredMoves[0].key}`, { replace: true });
    }
  }, [id, filteredMoves, navigate]);

  useEffect(() => {
    if (id && filteredMoves.length > 0 && !filteredMoves.find((m: any) => m.key === id)) {
      navigate(`/moves/${filteredMoves[0].key}`, { replace: true });
    }
  }, [filteredMoves, id, navigate]);

  const removeFilter = (cat: keyof MoveActiveFilters, value: string) => {
    setActiveFilters((prev) => ({ ...prev, [cat]: prev[cat].filter((v) => v !== value) }));
  };

  const clearAll = () => {
    setSearchTerm('');
    setActiveFilters({ types: [], categories: [], effects: [] });
    setSortBy('alpha-asc');
    setHasTmOnly(false);
    setMinPower('');
    setMaxPower('');
  };

  return (
    <div className="moves-page">
      <MoveFilterBar
        searchTerm={searchTerm}
        setSearchTerm={setSearchTerm}
        activeFilters={activeFilters}
        setActiveFilters={setActiveFilters}
        sortBy={sortBy}
        setSortBy={setSortBy}
        hasTmOnly={hasTmOnly}
        setHasTmOnly={setHasTmOnly}
        minPower={minPower}
        setMinPower={setMinPower}
        maxPower={maxPower}
        setMaxPower={setMaxPower}
        allEffects={allEffects}
        removeFilter={removeFilter}
        clearAll={clearAll}
      />
      <div className="moves-page-content">
        <MoveSidebar filteredMoves={filteredMoves} activeId={id} tmByMove={tmByMove} />
        <div className="moves-detail-area">
          {id ? (
            <MoveDetailPage tmByMove={tmByMove} pokemonArray={pokemonArray} />
          ) : (
            <div className="empty-selection">
              <h2>Select a Move</h2>
              <p>
                {filteredMoves.length === 0
                  ? 'No moves match the current filters.'
                  : 'Click a move to view its details.'}
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
