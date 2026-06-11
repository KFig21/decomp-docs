/* eslint-disable @typescript-eslint/no-explicit-any */
import { useState, useMemo, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useData } from '../../contexts/dataContext';
import { TYPE_OPTIONS } from '../pokemonPage/components/pokemonFilterBar/PokemonFilterBar';
import TypesSidebar from './components/typesSidebar/TypesSidebar';
import TypesFilterBar from './components/typesFilterBar/TypesFilterBar';
import TypeDetailPage from './components/typeDetailPage/TypeDetailPage';
import './styles.scss';

export type TypeSortOption = 'alpha' | 'pokemon-count' | 'move-count';

export default function TypesPage() {
  const { pokemon, moves } = useData();
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();

  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState<TypeSortOption>('alpha');
  const [primaryOnly, setPrimaryOnly] = useState(false);

  const pokemonArray = useMemo(
    () => (Array.isArray(pokemon) ? pokemon : Object.values(pokemon)) as any[],
    [pokemon],
  );
  const movesArray = useMemo(
    () => (Array.isArray(moves) ? moves : Object.values(moves)) as any[],
    [moves],
  );

  const typeStats = useMemo(() => {
    const stats: Record<string, { pokemonCount: number; moveCount: number }> = {};
    for (const type of TYPE_OPTIONS) {
      const typeLower = type.toLowerCase();

      const pokemonCount = pokemonArray.filter((mon: any) => {
        if (mon.baseSpeciesKey) return false;
        if (!mon.isSeen && !mon.isObtainable) return false;
        const types = (mon.types ?? []) as string[];
        if (primaryOnly) {
          return (types[0] ?? '').replace(/^TYPE_/i, '').toLowerCase() === typeLower;
        }
        return types
          .filter(Boolean)
          .some((t: string) => t.replace(/^TYPE_/i, '').toLowerCase() === typeLower);
      }).length;

      const moveCount = movesArray.filter((move: any) =>
        (move.type ?? '').replace(/^TYPE_/i, '').toLowerCase() === typeLower,
      ).length;

      stats[type] = { pokemonCount, moveCount };
    }
    return stats;
  }, [pokemonArray, movesArray, primaryOnly]);

  const filteredTypes = useMemo(() => {
    let result = [...TYPE_OPTIONS];
    if (searchTerm) {
      result = result.filter((t) => t.toLowerCase().includes(searchTerm.toLowerCase()));
    }
    if (sortBy === 'pokemon-count') {
      result.sort((a, b) => (typeStats[b]?.pokemonCount ?? 0) - (typeStats[a]?.pokemonCount ?? 0));
    } else if (sortBy === 'move-count') {
      result.sort((a, b) => (typeStats[b]?.moveCount ?? 0) - (typeStats[a]?.moveCount ?? 0));
    }
    return result;
  }, [searchTerm, sortBy, typeStats]);

  useEffect(() => {
    if (!id && filteredTypes.length > 0) {
      navigate(`/types/${filteredTypes[0].toLowerCase()}`, { replace: true });
    }
  }, [id, filteredTypes, navigate]);

  const clearAll = () => {
    setSearchTerm('');
    setSortBy('alpha');
    setPrimaryOnly(false);
  };

  return (
    <div className="types-page">
      <TypesFilterBar
        searchTerm={searchTerm}
        setSearchTerm={setSearchTerm}
        sortBy={sortBy}
        setSortBy={setSortBy}
        primaryOnly={primaryOnly}
        setPrimaryOnly={setPrimaryOnly}
        clearAll={clearAll}
      />
      <div className="types-page-content">
        <TypesSidebar filteredTypes={filteredTypes} typeStats={typeStats} activeId={id} />
        <div className="types-detail-area">
          {id ? (
            <TypeDetailPage
              typeId={id}
              pokemonArray={pokemonArray}
              movesArray={movesArray}
              primaryOnly={primaryOnly}
            />
          ) : (
            <div className="empty-selection">
              <h2>Select a Type</h2>
              <p>Click a type to view its Pokémon and moves.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
