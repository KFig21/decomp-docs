/* eslint-disable @typescript-eslint/no-explicit-any */
import { useState, useMemo, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useData } from '../../contexts/dataContext';
import ItemDetailPage from './components/itemDetailPage/ItemDetailPage';
import ItemSidebar from './components/itemSidebar/ItemSidebar';
import ItemFilterBar from './components/itemFilterBar/ItemFilterBar';
import './styles.scss';

export type ActiveFilters = {
  pockets: string[];
  methods: string[];
};

export type SortOption =
  | 'alpha-asc'
  | 'alpha-desc'
  | 'locations-desc'
  | 'locations-asc'
  | 'price-asc'
  | 'price-desc';

// eslint-disable-next-line react-refresh/only-export-components
export const SORT_OPTIONS: { value: SortOption; label: string }[] = [
  { value: 'alpha-asc', label: 'A → Z' },
  { value: 'alpha-desc', label: 'Z → A' },
  { value: 'locations-desc', label: 'Most Common' },
  { value: 'locations-asc', label: 'Least Common' },
  { value: 'price-desc', label: 'Price: High → Low' },
  { value: 'price-asc', label: 'Price: Low → High' },
];

function sortItems(items: any[], sort: SortOption): any[] {
  const arr = [...items];
  switch (sort) {
    case 'alpha-asc':
      return arr.sort((a, b) => (a.name ?? '').localeCompare(b.name ?? ''));
    case 'alpha-desc':
      return arr.sort((a, b) => (b.name ?? '').localeCompare(a.name ?? ''));
    case 'locations-desc':
      return arr.sort((a, b) => (b.locations?.length ?? 0) - (a.locations?.length ?? 0));
    case 'locations-asc':
      return arr.sort((a, b) => (a.locations?.length ?? 0) - (b.locations?.length ?? 0));
    case 'price-desc':
      return arr.sort((a, b) => (b.price ?? 0) - (a.price ?? 0));
    case 'price-asc':
      return arr.sort((a, b) => (a.price ?? 0) - (b.price ?? 0));
    default:
      return arr;
  }
}

export default function ItemsPage() {
  const { items } = useData();
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();

  const [searchTerm, setSearchTerm] = useState('');
  const [activeFilters, setActiveFilters] = useState<ActiveFilters>({ pockets: [], methods: [] });
  const [evolutionOnly, setEvolutionOnly] = useState(false);
  const [sortBy, setSortBy] = useState<SortOption>('alpha-asc');

  const itemsArray = (Array.isArray(items) ? items : Object.values(items || {})) as any[];

  const filteredItems = useMemo(() => {
    const filtered = itemsArray.filter((item) => {
      if (item.name === '??????????' || item.key === 'ITEM_NONE') return false;
      if (!item.isPlaced) return false;
      if (searchTerm && !item.name?.toLowerCase().includes(searchTerm.toLowerCase())) return false;
      if (
        activeFilters.pockets.length > 0 &&
        !activeFilters.pockets.includes(item.pocketCategory ?? 'items')
      )
        return false;
      if (activeFilters.methods.length > 0) {
        const locs: any[] = item.locations ?? [];
        if (!locs.some((l) => activeFilters.methods.includes(l.method))) return false;
      }
      if (evolutionOnly && !item.isEvolutionItem) return false;
      return true;
    });

    return sortItems(filtered, sortBy);
  }, [itemsArray, searchTerm, activeFilters, evolutionOnly, sortBy]);

  useEffect(() => {
    if (!id && filteredItems.length > 0) {
      navigate(`/items/${filteredItems[0].key}`, { replace: true });
    }
  }, [id, filteredItems, navigate]);

  useEffect(() => {
    if (id && filteredItems.length > 0 && !filteredItems.find((i) => i.key === id)) {
      navigate(`/items/${filteredItems[0].key}`, { replace: true });
    }
  }, [filteredItems, id, navigate]);

  const removeFilter = (category: keyof ActiveFilters, value: string) => {
    setActiveFilters((prev) => ({
      ...prev,
      [category]: prev[category].filter((v) => v !== value),
    }));
  };

  const clearAll = () => {
    setSearchTerm('');
    setActiveFilters({ pockets: [], methods: [] });
    setEvolutionOnly(false);
  };

  return (
    <div className="items-page">
      <ItemFilterBar
        searchTerm={searchTerm}
        setSearchTerm={setSearchTerm}
        activeFilters={activeFilters}
        setActiveFilters={setActiveFilters}
        evolutionOnly={evolutionOnly}
        setEvolutionOnly={setEvolutionOnly}
        removeFilter={removeFilter}
        clearAll={clearAll}
        sortBy={sortBy}
        setSortBy={setSortBy}
      />
      <div className="items-page-content">
        <ItemSidebar filteredItems={filteredItems} activeId={id} />
        <div className="items-detail-area">
          {id ? (
            <ItemDetailPage />
          ) : (
            <div className="empty-selection">
              <h2>Select an Item</h2>
              <p>
                {filteredItems.length === 0
                  ? 'No items match the current filters.'
                  : 'Click an item in the list to view its details.'}
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
