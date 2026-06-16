/* eslint-disable react-refresh/only-export-components */
/* eslint-disable @typescript-eslint/no-explicit-any */
import { useState, useMemo, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useData } from '../../contexts/dataContext';
import { TrainerTabProvider } from '../../contexts/trainerTabContext';
import TrainerSidebar from './components/trainerSidebar/TrainerSidebar';
import TrainerFilterBar from './components/trainerFilterBar/TrainerFilterBar';
import TrainerDetailPage from './components/trainerDetailPage/TrainerDetailPage';
import {
  THREAT_MOVE_ALL,
  THREAT_MOVE_OPTIONS,
} from '../../constants/threatMoves';
import './styles.scss';

export type TrainerActiveFilters = {
  classes: string[];
  battleTypes: string[];
  threatMoves: string[];
};

export type TrainerSortOption = 'alpha-asc' | 'alpha-desc' | 'party-desc' | 'battles-desc';

export const TRAINER_SORT_OPTIONS: { value: TrainerSortOption; label: string }[] = [
  { value: 'alpha-asc', label: 'A → Z' },
  { value: 'alpha-desc', label: 'Z → A' },
  { value: 'party-desc', label: 'Highest Level First' },
  { value: 'battles-desc', label: 'Most Battles First' },
];

export interface BaseTrainerEntry {
  baseKey: string;
  name: string;
  trainerClass: string;
  trainerPic: string;
  placedVariants: any[];
  uniqueLocations: number;
  maxLevel: number;
  isDouble: boolean;
}

function applySort(trainers: BaseTrainerEntry[], sort: TrainerSortOption): BaseTrainerEntry[] {
  const arr = [...trainers];
  switch (sort) {
    case 'alpha-asc':
      return arr.sort((a, b) => a.name.localeCompare(b.name));
    case 'alpha-desc':
      return arr.sort((a, b) => b.name.localeCompare(a.name));
    case 'party-desc':
      return arr.sort((a, b) => b.maxLevel - a.maxLevel);
    case 'battles-desc':
      return arr.sort((a, b) => b.uniqueLocations - a.uniqueLocations);
    default:
      return arr;
  }
}

export default function TrainersPage() {
  const { trainers } = useData();
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();

  const [searchTerm, setSearchTerm] = useState('');
  const [activeFilters, setActiveFilters] = useState<TrainerActiveFilters>({
    classes: [],
    battleTypes: [],
    threatMoves: [],
  });
  const [sortBy, setSortBy] = useState<TrainerSortOption>('alpha-asc');

  // Build base trainer entries from context data
  const baseTrainers = useMemo<BaseTrainerEntry[]>(() => {
    const result: BaseTrainerEntry[] = [];
    for (const [baseKey, group] of Object.entries(trainers || {})) {
      const placedVariants = ((group as any).variants ?? []).filter((v: any) => v.isPlaced);
      if (placedVariants.length === 0) continue;

      const rep = placedVariants[0];

      const uniqueLocations = new Set(
        placedVariants.map((v: any) => v.location?.mapKey ?? v.location?.locationKey ?? v.key),
      ).size;

      const maxLevel = placedVariants.reduce((max: number, v: any) => {
        const vMax = (v.party ?? []).reduce((m: number, p: any) => Math.max(m, p.level ?? 0), 0);
        return Math.max(max, vMax);
      }, 0);

      const isDouble = placedVariants.some((v: any) => v.doubleBattle);

      result.push({
        baseKey,
        name: rep.name,
        trainerClass: rep.trainerClass,
        trainerPic: rep.trainerPic,
        placedVariants,
        uniqueLocations,
        maxLevel,
        isDouble,
      });
    }
    return result;
  }, [trainers]);

  // All unique trainer classes + one representative sprite per class
  const allClasses = useMemo(() => {
    const set = new Set<string>();
    for (const t of baseTrainers) {
      if (t.trainerClass) set.add(t.trainerClass);
    }
    return Array.from(set).sort();
  }, [baseTrainers]);

  const classSprites = useMemo(() => {
    const map: Record<string, string> = {};
    for (const t of baseTrainers) {
      if (t.trainerClass && t.trainerPic && !map[t.trainerClass]) {
        map[t.trainerClass] = t.trainerPic;
      }
    }
    return map;
  }, [baseTrainers]);

  const filteredTrainers = useMemo(() => {
    const filtered = baseTrainers.filter((t) => {
      if (searchTerm) {
        const s = searchTerm.toLowerCase();
        if (!t.name?.toLowerCase().includes(s) && !t.trainerClass?.toLowerCase().includes(s))
          return false;
      }
      if (activeFilters.classes.length > 0 && !activeFilters.classes.includes(t.trainerClass))
        return false;
      if (activeFilters.battleTypes.length > 0) {
        const hasSingle = t.placedVariants.some((v) => !v.doubleBattle);
        const hasDouble = t.placedVariants.some((v) => v.doubleBattle);
        const wantSingle = activeFilters.battleTypes.includes('single');
        const wantDouble = activeFilters.battleTypes.includes('double');
        if (wantSingle && !hasSingle) return false;
        if (wantDouble && !hasDouble) return false;
      }
      if (activeFilters.threatMoves.length > 0) {
        const matchList = activeFilters.threatMoves.includes(THREAT_MOVE_ALL)
          ? THREAT_MOVE_OPTIONS.map((o) => o.value)
          : activeFilters.threatMoves;
        const hasThreat = t.placedVariants.some((v: any) =>
          (v.party ?? []).some((p: any) =>
            (p.moves ?? []).some((m: any) => {
              if (!m?.name) return false;
              const normalized = m.name.toLowerCase().replace(/[\s-]/g, '');
              return matchList.includes(normalized);
            }),
          ),
        );
        if (!hasThreat) return false;
      }
      return true;
    });
    return applySort(filtered, sortBy);
  }, [baseTrainers, searchTerm, activeFilters, sortBy]);

  useEffect(() => {
    if (!id && filteredTrainers.length > 0) {
      navigate(`/trainers/${filteredTrainers[0].baseKey}`, { replace: true });
    }
  }, [id, filteredTrainers, navigate]);

  useEffect(() => {
    if (id && filteredTrainers.length > 0 && !filteredTrainers.find((t) => t.baseKey === id)) {
      navigate(`/trainers/${filteredTrainers[0].baseKey}`, { replace: true });
    }
  }, [filteredTrainers, id, navigate]);

  const removeFilter = (cat: keyof TrainerActiveFilters, value: string) => {
    setActiveFilters((prev) => ({ ...prev, [cat]: prev[cat].filter((v) => v !== value) }));
  };

  const clearAll = () => {
    setSearchTerm('');
    setActiveFilters({ classes: [], battleTypes: [], threatMoves: [] });
    setSortBy('alpha-asc');
  };

  return (
    <TrainerTabProvider>
      <div className="trainers-page">
        <TrainerFilterBar
          searchTerm={searchTerm}
          setSearchTerm={setSearchTerm}
          activeFilters={activeFilters}
          setActiveFilters={setActiveFilters}
          allClasses={allClasses}
          classSprites={classSprites}
          sortBy={sortBy}
          setSortBy={setSortBy}
          removeFilter={removeFilter}
          clearAll={clearAll}
        />
        <div className="trainers-page-content">
          <TrainerSidebar filteredTrainers={filteredTrainers} activeId={id} />
          <div className="trainers-detail-area">
            {id ? (
              <TrainerDetailPage />
            ) : (
              <div className="empty-selection">
                <h2>Select a Trainer</h2>
                <p>
                  {filteredTrainers.length === 0
                    ? 'No trainers match the current filters.'
                    : 'Click a trainer in the list to view their details.'}
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </TrainerTabProvider>
  );
}
