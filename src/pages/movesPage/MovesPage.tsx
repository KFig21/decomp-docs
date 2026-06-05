/* eslint-disable react-refresh/only-export-components */
/* eslint-disable @typescript-eslint/no-explicit-any */
import { useState, useMemo, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useData } from '../../contexts/dataContext';
import MoveSidebar from './components/moveSidebar/MoveSidebar';
import './styles.scss';
import MoveFilterBar from './components/moveFilterBar/MoveFilterBar';
import MoveDetailPage from './MoveDetailPage';

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

// Normalise raw CATEGORY_ / split_ identifiers to display strings
export function normalizeMoveCategory(raw: string | undefined): string {
  if (!raw) return 'Status';
  const s = raw.toUpperCase();
  if (s.includes('PHYSICAL') || (s.includes('DAMAGE') && !s.includes('SPECIAL'))) return 'Physical';
  if (s.includes('SPECIAL')) return 'Special';
  return 'Status';
}

// Converts TYPE_FIRE → Fire
export function normalizeTypeName(raw: string | undefined): string {
  if (!raw) return '';
  return (
    raw
      .replace(/^TYPE_/i, '')
      .charAt(0)
      .toUpperCase() +
    raw
      .replace(/^TYPE_/i, '')
      .slice(1)
      .toLowerCase()
  );
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

  // Build tm item lookup: moveKey -> TM item
  const tmByMove = useMemo(() => {
    const map: Record<string, any> = {};
    for (const item of itemsArray as any[]) {
      if (!item.key?.startsWith('ITEM_TM') && !item.key?.startsWith('ITEM_HM')) continue;
      // TM item key pattern: ITEM_TM01_FOCUS_PUNCH or ITEM_TM_FOCUS_PUNCH
      // Move key is built from the item key by stripping ITEM_TM##_
      const moveKey = 'MOVE_' + item.key.replace(/^ITEM_(TM\d+_|HM\d+_|TM_|HM_)/, '');
      if (moveKey in (moves || {})) map[moveKey] = item;
    }
    return map;
  }, [itemsArray, moves]);

  // Collect all unique effects for the filter dropdown
  const allEffects = useMemo(() => {
    const set = new Set<string>();
    for (const m of movesArray as any[]) {
      if (m.effect && m.effect !== 'EFFECT_HIT' && m.effect !== 'EFFECT_NORMAL_HIT') {
        const label = m.effect
          .replace(/^EFFECT_/, '')
          .replace(/_/g, ' ')
          .toLowerCase()
          .replace(/\b\w/g, (c: string) => c.toUpperCase());
        set.add(label);
      }
    }
    return Array.from(set).sort();
  }, [movesArray]);

  const filteredMoves = useMemo(() => {
    const filtered = (movesArray as any[]).filter((move) => {
      if (move.key === 'MOVE_NONE') return false;
      if (!move.name || move.name === '????' || move.name === 'None') return false;

      if (searchTerm && !move.name.toLowerCase().includes(searchTerm.toLowerCase())) return false;

      if (activeFilters.types.length > 0) {
        const moveType = normalizeTypeName(move.type).toLowerCase();
        if (!activeFilters.types.some((t) => t.toLowerCase() === moveType)) return false;
      }

      if (activeFilters.categories.length > 0) {
        const cat = normalizeMoveCategory(move.category || move.split);
        if (!activeFilters.categories.includes(cat)) return false;
      }

      if (activeFilters.effects.length > 0) {
        const effectLabel = move.effect
          ? move.effect
              .replace(/^EFFECT_/, '')
              .replace(/_/g, ' ')
              .toLowerCase()
              .replace(/\b\w/g, (c: string) => c.toUpperCase())
          : '';
        if (!activeFilters.effects.includes(effectLabel)) return false;
      }

      if (hasTmOnly && !tmByMove[move.key]) return false;

      if (minPower && (move.power ?? 0) < Number(minPower)) return false;
      if (maxPower && (move.power ?? 0) > Number(maxPower)) return false;

      return true;
    });

    return applySort(filtered, sortBy);
  }, [movesArray, searchTerm, activeFilters, sortBy, hasTmOnly, tmByMove, minPower, maxPower]);

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
