/* eslint-disable @typescript-eslint/no-explicit-any */
import { useState, useMemo, useEffect, useRef } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useData } from '../../contexts/dataContext';
import PokemonSprite from '../../components/elements/sprites/pokemon/PokemonSprite';
import PokemonDetailPage from './components/pokemonDetailPage/PokemonDetailPage';
import PokemonSidebar from './components/pokemonSidebar/PokemonSidebar';
import PokemonFilterBar from './components/pokemonFilterBar/PokemonFilterBar';
import './styles.scss';

export type PokemonActiveFilters = {
  types1: string[]; // first type constraint (OR within set)
  types2: string[]; // second type constraint (OR within set, AND with types1)
  encounters: string[]; // encounter method filter (OR within set)
};

export default function PokemonPage() {
  const { pokemon, locations } = useData();
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();

  const [searchTerm, setSearchTerm] = useState('');
  const [showEvolvesWithItem, setShowEvolvesWithItem] = useState(false);
  const prevIdRef = useRef<string | undefined>(undefined);
  const [showObtainableOnly, setShowObtainableOnly] = useState(false);
  const [activeFilters, setActiveFilters] = useState<PokemonActiveFilters>({
    types1: [],
    types2: [],
    encounters: [],
  });
  const [minBst, setMinBst] = useState('');
  const [maxBst, setMaxBst] = useState('');
  const [moveFilter, setMoveFilter] = useState('');
  const [sortBy, setSortBy] = useState('pokedex');

  const pokemonArray = (Array.isArray(pokemon) ? pokemon : Object.values(pokemon)) as any[];

  // Pre-calculate encounter methods per pokemon
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

  const filteredPokemon = useMemo(() => {
    const result = pokemonArray.filter((mon) => {
      if (mon.name === '??????????') return false;

      // Variants (e.g. SPECIES_PIKACHU_ALOLA) are accessible via the variant
      // selector on the base form's page — exclude them from the sidebar list.
      if (mon.baseSpeciesKey) return false;

      // Obtainability
      if (showObtainableOnly && !mon.isObtainable) return false;
      if (!showObtainableOnly && !mon.isSeen && !mon.isObtainable) return false;

      // Name search
      if (searchTerm && !mon.name.toLowerCase().includes(searchTerm.toLowerCase())) return false;

      // Type filter
      // mon.types is [primaryType, secondaryType | null]
      // Normalise to a Set of the mon's actual types (lowercased, filtered)
      if (activeFilters.types1.length > 0 || activeFilters.types2.length > 0) {
        const monTypes = new Set<string>(
          (mon.types ?? [])
            .filter((t: any) => t && typeof t === 'string')
            .map((t: string) => t.replace('TYPE_', '').toLowerCase()),
        );

        // Normalise filter arrays to lowercase bare type names
        const norm = (arr: string[]) => arr.map((t) => t.toLowerCase());

        if (activeFilters.types1.length > 0) {
          const t1 = norm(activeFilters.types1);
          if (!t1.some((t) => monTypes.has(t))) return false;
        }
        if (activeFilters.types2.length > 0) {
          const t2 = norm(activeFilters.types2);
          if (!t2.some((t) => monTypes.has(t))) return false;
        }
      }

      // BST
      const bst = mon.baseStats
        ? (Object.values(mon.baseStats).reduce(
            (a: any, c: any) => Number(a) + Number(c),
            0,
          ) as number)
        : 0;
      if (minBst && bst < Number(minBst)) return false;
      if (maxBst && bst > Number(maxBst)) return false;

      // Evolves with item
      if (showEvolvesWithItem) {
        const hasItemEvo = mon.evolutions?.some((e: any) => {
          const method = (e.method as string | undefined)?.replace('EVO_', '');
          return method === 'ITEM' || method === 'TRADE_ITEM';
        });
        if (!hasItemEvo) return false;
      }

      // Move search
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

      // Encounter filter (multi-select, OR within)
      if (activeFilters.encounters.length > 0) {
        const methods = encounterMethodsByMon.get(mon.key);
        if (!methods) return false;

        const methodArr = Array.from(methods);
        const hasAny = activeFilters.encounters.some((ef) => {
          const e = ef.toLowerCase();
          if (e === 'surfing') return methodArr.some((m) => m.includes('water'));
          if (e === 'rock smash') return methodArr.some((m) => m.includes('rock_smash'));
          if (e === 'old rod')
            return methodArr.some(
              (m) => m.includes('old_rod') || (m.includes('fishing') && m.includes('old')),
            );
          if (e === 'good rod')
            return methodArr.some(
              (m) => m.includes('good_rod') || (m.includes('fishing') && m.includes('good')),
            );
          if (e === 'super rod')
            return methodArr.some(
              (m) => m.includes('super_rod') || (m.includes('fishing') && m.includes('super')),
            );
          if (e === 'fishing')
            return methodArr.some((m) => m.includes('fishing') || m.includes('rod'));
          if (e === 'static') return methodArr.some((m) => m === 'static');
          if (e === 'land') return methodArr.some((m) => m.includes('land'));
          return methodArr.some((m) => m.includes(e));
        });
        if (!hasAny) return false;
      }

      return true;
    });

    // Sort
    if (sortBy === 'alpha') result.sort((a, b) => a.name.localeCompare(b.name));
    else if (sortBy === 'bst') {
      result.sort((a, b) => {
        const bA = Object.values(a.baseStats || {}).reduce(
          (s: any, v: any) => Number(s) + Number(v),
          0,
        ) as number;
        const bB = Object.values(b.baseStats || {}).reduce(
          (s: any, v: any) => Number(s) + Number(v),
          0,
        ) as number;
        return bB - bA;
      });
    } else if (sortBy === 'type') {
      result.sort((a, b) => (a.types?.[0] ?? '').localeCompare(b.types?.[0] ?? ''));
    }
    return result;
  }, [
    pokemonArray,
    searchTerm,
    showObtainableOnly,
    activeFilters,
    minBst,
    maxBst,
    moveFilter,
    sortBy,
    encounterMethodsByMon,
    showEvolvesWithItem,
  ]);

  useEffect(() => {
    if (!id && filteredPokemon.length > 0) {
      navigate(`/pokemon/${filteredPokemon[0].key}`, { replace: true });
    }
  }, [id, filteredPokemon, navigate]);

  // If the selected mon is not in the current filtered list:
  // - id just changed (user navigated via evolution family/link) → clear filters to reveal it
  // - filteredPokemon changed (user is typing/filtering) → redirect to first filtered result
  useEffect(() => {
    if (id && filteredPokemon.length > 0 && !filteredPokemon.find((p) => p.key === id)) {
      const idJustChanged = prevIdRef.current !== id;
      if (idJustChanged) {
        const existsInData = pokemonArray.some((p) => p.key === id);
        if (existsInData) {
          setSearchTerm('');
          setActiveFilters({ types1: [], types2: [], encounters: [] });
          setMinBst('');
          setMaxBst('');
          setMoveFilter('');
        } else {
          navigate(`/pokemon/${filteredPokemon[0].key}`, { replace: true });
        }
      } else {
        navigate(`/pokemon/${filteredPokemon[0].key}`, { replace: true });
      }
    }
    prevIdRef.current = id;
  }, [filteredPokemon, id, navigate, pokemonArray]);

  const removeFilter = (cat: keyof PokemonActiveFilters, value: string) => {
    setActiveFilters((prev) => ({ ...prev, [cat]: prev[cat].filter((v) => v !== value) }));
  };

  const clearAll = () => {
    setSearchTerm('');
    setShowObtainableOnly(false);
    setShowEvolvesWithItem(false);
    setActiveFilters({ types1: [], types2: [], encounters: [] });
    setMinBst('');
    setMaxBst('');
    setMoveFilter('');
    setSortBy('pokedex');
  };

  return (
    <div className="pokemon-page">
      <PokemonFilterBar
        searchTerm={searchTerm}
        setSearchTerm={setSearchTerm}
        showObtainableOnly={showObtainableOnly}
        setShowObtainableOnly={setShowObtainableOnly}
        showEvolvesWithItem={showEvolvesWithItem}
        setShowEvolvesWithItem={setShowEvolvesWithItem}
        activeFilters={activeFilters}
        setActiveFilters={setActiveFilters}
        removeFilter={removeFilter}
        clearAll={clearAll}
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
