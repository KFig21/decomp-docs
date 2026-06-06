/* eslint-disable react-refresh/only-export-components */
/* eslint-disable @typescript-eslint/no-explicit-any */
import { useState, useMemo, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useData } from '../../contexts/dataContext';
import TrainerSidebar from './components/trainerSidebar/TrainerSidebar';
import TrainerFilterBar from './components/trainerFilterBar/TrainerFilterBar';
import TrainerDetailPage from './TrainerDetailPage';
import './styles.scss';

export type TrainerActiveFilters = {
  classes: string[];
  battleTypes: string[];
};

export type TrainerSortOption = 'alpha-asc' | 'alpha-desc' | 'party-desc' | 'party-asc';

export const TRAINER_SORT_OPTIONS: { value: TrainerSortOption; label: string }[] = [
  { value: 'alpha-asc', label: 'A → Z' },
  { value: 'alpha-desc', label: 'Z → A' },
  { value: 'party-desc', label: 'Party: Largest First' },
  { value: 'party-asc', label: 'Party: Smallest First' },
];

function applySort(trainers: any[], sort: TrainerSortOption): any[] {
  const arr = [...trainers];
  switch (sort) {
    case 'alpha-asc':
      return arr.sort((a, b) => (a.name ?? '').localeCompare(b.name ?? ''));
    case 'alpha-desc':
      return arr.sort((a, b) => (b.name ?? '').localeCompare(a.name ?? ''));
    case 'party-desc':
      return arr.sort((a, b) => (b.party?.length ?? 0) - (a.party?.length ?? 0));
    case 'party-asc':
      return arr.sort((a, b) => (a.party?.length ?? 0) - (b.party?.length ?? 0));
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
  });
  const [sortBy, setSortBy] = useState<TrainerSortOption>('alpha-asc');

  // Flatten all placed variants into a single array
  const variantsArray = useMemo(() => {
    const arr: any[] = [];
    for (const group of Object.values(trainers || {})) {
      for (const variant of (group as any).variants ?? []) {
        if (variant.isPlaced) arr.push(variant);
      }
    }
    return arr;
  }, [trainers]);

  // All unique trainer classes for the filter dropdown
  const allClasses = useMemo(() => {
    const set = new Set<string>();
    for (const v of variantsArray) {
      if (v.trainerClass) set.add(v.trainerClass);
    }
    return Array.from(set).sort();
  }, [variantsArray]);

  const filteredTrainers = useMemo(() => {
    const filtered = variantsArray.filter((v) => {
      if (searchTerm) {
        const search = searchTerm.toLowerCase();
        const nameMatch = v.name?.toLowerCase().includes(search);
        const classMatch = v.trainerClass?.toLowerCase().includes(search);
        if (!nameMatch && !classMatch) return false;
      }
      if (activeFilters.classes.length > 0 && !activeFilters.classes.includes(v.trainerClass)) {
        return false;
      }
      if (activeFilters.battleTypes.length > 0) {
        const type = v.doubleBattle ? 'double' : 'single';
        if (!activeFilters.battleTypes.includes(type)) return false;
      }
      return true;
    });
    return applySort(filtered, sortBy);
  }, [variantsArray, searchTerm, activeFilters, sortBy]);

  useEffect(() => {
    if (!id && filteredTrainers.length > 0) {
      navigate(`/trainers/${filteredTrainers[0].key}`, { replace: true });
    }
  }, [id, filteredTrainers, navigate]);

  useEffect(() => {
    if (id && filteredTrainers.length > 0 && !filteredTrainers.find((t: any) => t.key === id)) {
      navigate(`/trainers/${filteredTrainers[0].key}`, { replace: true });
    }
  }, [filteredTrainers, id, navigate]);

  const removeFilter = (cat: keyof TrainerActiveFilters, value: string) => {
    setActiveFilters((prev) => ({ ...prev, [cat]: prev[cat].filter((v) => v !== value) }));
  };

  const clearAll = () => {
    setSearchTerm('');
    setActiveFilters({ classes: [], battleTypes: [] });
    setSortBy('alpha-asc');
  };

  return (
    <div className="trainers-page">
      <TrainerFilterBar
        searchTerm={searchTerm}
        setSearchTerm={setSearchTerm}
        activeFilters={activeFilters}
        setActiveFilters={setActiveFilters}
        allClasses={allClasses}
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
  );
}
