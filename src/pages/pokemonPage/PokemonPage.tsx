/* eslint-disable @typescript-eslint/no-explicit-any */
import { useState, useMemo, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useData } from '../../contexts/dataContext';
import PokemonSprite from '../../components/elements/sprites/PokemonSprite';
import PokemonDetailPage from './PokemonDetailPage';
import PokemonSidebar from './components/pokemonSidebar/PokemonSidebar';
import FilterBar from './components/filterBar/FilterBar';
import './styles.scss';

export default function PokemonPage() {
  const { pokemon, locations } = useData();
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();

  // States
  const [searchTerm, setSearchTerm] = useState('');
  const [showObtainableOnly, setShowObtainableOnly] = useState(false);
  const [typeFilter, setTypeFilter] = useState('All');
  const [encounterFilter, setEncounterFilter] = useState('All');
  const [minBst, setMinBst] = useState('');
  const [maxBst, setMaxBst] = useState('');
  const [moveFilter, setMoveFilter] = useState('');
  const [sortBy, setSortBy] = useState('pokedex');

  const pokemonArray = (Array.isArray(pokemon) ? pokemon : Object.values(pokemon)) as any[];

  // Pre-calculate encounter methods for performance
  const encounterMethodsByMon = useMemo(() => {
    const map = new Map<string, Set<string>>();
    const locationsArray = Array.isArray(locations) ? locations : Object.values(locations);

    locationsArray.forEach((locRoot: any) => {
      Object.values(locRoot.maps || {}).forEach((mapObj: any) => {
        (mapObj.wildPokemon || []).forEach((table: any) => {
          const method = (table.method || '').toLowerCase();
          table.encounters.forEach((enc: any) => {
            const key = enc.pokemon?.key;
            if (key) {
              if (!map.has(key)) map.set(key, new Set());
              map.get(key)!.add(method);
            }
          });
        });
        (mapObj.staticEncounters || []).forEach((enc: any) => {
          const key = enc.species?.key;
          if (key) {
            if (!map.has(key)) map.set(key, new Set());
            map.get(key)!.add('static');
          }
        });
      });
    });
    return map;
  }, [locations]);

  // Apply Filters & Sorting
  const filteredPokemon = useMemo(() => {
    const result = pokemonArray.filter((mon) => {
      if (mon.name === '??????????') return false;

      // 1. Obtainability
      if (showObtainableOnly && !mon.isObtainable) return false;
      if (!showObtainableOnly && !mon.isSeen && !mon.isObtainable) return false;

      // 2. Name Search
      if (searchTerm && !mon.name.toLowerCase().includes(searchTerm.toLowerCase())) return false;

      // 3. Type Filter
      if (typeFilter !== 'All') {
        const hasType = mon.types?.some(
          (t: string | null) => t && t.toLowerCase().includes(typeFilter.toLowerCase()),
        );
        if (!hasType) return false;
      }

      // 4. BST Filter
      const bst = mon.baseStats
        ? (Object.values(mon.baseStats).reduce(
            (a: any, c: any) => Number(a) + Number(c),
            0,
          ) as number)
        : 0;
      if (minBst && bst < Number(minBst)) return false;
      if (maxBst && bst > Number(maxBst)) return false;

      // 5. Move Filter
      if (moveFilter) {
        const term = moveFilter.toLowerCase();
        const hasLevelUp = mon.levelUpLearnset?.some((l: any) => {
          const name = typeof l.move === 'string' ? l.move : l.move?.name;
          return name?.toLowerCase().includes(term);
        });
        const hasTmHm = mon.tmhmLearnset?.some((l: any) => {
          const name = typeof l.move === 'string' ? l.move : l.move?.name;
          return name?.toLowerCase().includes(term);
        });
        if (!hasLevelUp && !hasTmHm) return false;
      }

      // 6. Encounter Filter
      if (encounterFilter !== 'All') {
        const methods = encounterMethodsByMon.get(mon.key);
        if (!methods) return false;

        const eFilter = encounterFilter.toLowerCase();
        let match = false;
        if (eFilter === 'surfing') {
          match = Array.from(methods).some((m) => m.includes('water'));
        } else if (eFilter === 'fishing') {
          match = Array.from(methods).some((m) => m.includes('fishing') || m.includes('rod'));
        } else {
          match = Array.from(methods).some((m) => m.includes(eFilter));
        }

        if (!match) return false;
      }

      return true;
    });

    // 7. Sort
    if (sortBy === 'alpha') {
      result.sort((a, b) => a.name.localeCompare(b.name));
    } else if (sortBy === 'bst') {
      result.sort((a, b) => {
        const bstA = Object.values(a.baseStats || {}).reduce(
          (sum: any, val: any) => Number(sum) + Number(val),
          0,
        ) as number;
        const bstB = Object.values(b.baseStats || {}).reduce(
          (sum: any, val: any) => Number(sum) + Number(val),
          0,
        ) as number;
        return bstB - bstA;
      });
    } else if (sortBy === 'type') {
      result.sort((a, b) => {
        const typeA = a.types?.[0] || '';
        const typeB = b.types?.[0] || '';
        return typeA.localeCompare(typeB);
      });
    }
    // default 'pokedex' relies on the array's original parser order

    return result;
  }, [
    pokemonArray,
    searchTerm,
    showObtainableOnly,
    typeFilter,
    encounterFilter,
    minBst,
    maxBst,
    moveFilter,
    sortBy,
    encounterMethodsByMon,
  ]);

  useEffect(() => {
    if (!id && filteredPokemon.length > 0) {
      navigate(`/pokemon/${filteredPokemon[0].key}`, { replace: true });
    }
  }, [id, filteredPokemon, navigate]);

  return (
    <div className="pokemon-page">
      <FilterBar
        searchTerm={searchTerm}
        setSearchTerm={setSearchTerm}
        showObtainableOnly={showObtainableOnly}
        setShowObtainableOnly={setShowObtainableOnly}
        typeFilter={typeFilter}
        setTypeFilter={setTypeFilter}
        encounterFilter={encounterFilter}
        setEncounterFilter={setEncounterFilter}
        minBst={minBst}
        setMinBst={setMinBst}
        maxBst={maxBst}
        setMaxBst={setMaxBst}
        moveFilter={moveFilter}
        setMoveFilter={setMoveFilter}
        sortBy={sortBy}
        setSortBy={setSortBy}
      />

      <div className="pokemon-page-content">
        <PokemonSidebar filteredPokemon={filteredPokemon} activeId={id} />
        <div className="pokemon-detail-area">
          {id ? (
            <PokemonDetailPage />
          ) : (
            <div className="empty-selection">
              <PokemonSprite name="Pikachu" size={96} />
              <h2>Select a Pokémon</h2>
              <p>Click a Pokémon in the list to view its details.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
