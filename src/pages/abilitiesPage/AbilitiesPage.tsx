/* eslint-disable @typescript-eslint/no-explicit-any */
import { useState, useMemo, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useData } from '../../contexts/dataContext';
import AbilitySidebar from './components/abilitySidebar/AbilitySidebar';
import AbilityFilterBar, {
  type AbilitySortOption,
} from './components/abilityFilterBar/AbilityFilterBar';
import AbilityDetailPage from './components/abilityDetailPage/AbilityDetailPage';
import './styles.scss';

function sortAbilities(
  abilities: any[],
  sort: AbilitySortOption,
  counts: Record<string, number>,
): any[] {
  const arr = [...abilities];
  switch (sort) {
    case 'alpha-asc':
      return arr.sort((a, b) => (a.name ?? '').localeCompare(b.name ?? ''));
    case 'alpha-desc':
      return arr.sort((a, b) => (b.name ?? '').localeCompare(a.name ?? ''));
    case 'pokemon-desc':
      return arr.sort((a, b) => (counts[b.key] ?? 0) - (counts[a.key] ?? 0));
    case 'pokemon-asc':
      return arr.sort((a, b) => (counts[a.key] ?? 0) - (counts[b.key] ?? 0));
    default:
      return arr;
  }
}

export default function AbilitiesPage() {
  const { abilities, pokemon } = useData();
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();

  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState<AbilitySortOption>('alpha-asc');

  const abilitiesArray = useMemo(() => Object.values(abilities || {}) as any[], [abilities]);
  const pokemonArray = useMemo(() => Object.values(pokemon || {}) as any[], [pokemon]);

  // Count how many seen Pokémon have each ability (any slot)
  const pokemonCountByAbility = useMemo(() => {
    const counts: Record<string, number> = {};
    for (const mon of pokemonArray) {
      if (!mon.isSeen) continue;
      const seen = new Set<string>();
      for (const ab of mon.abilities ?? []) {
        if (ab?.key && !seen.has(ab.key)) {
          seen.add(ab.key);
          counts[ab.key] = (counts[ab.key] ?? 0) + 1;
        }
      }
    }
    return counts;
  }, [pokemonArray]);

  const filteredAbilities = useMemo(() => {
    const filtered = abilitiesArray.filter((ab) => {
      if (ab.key === 'ABILITY_NONE') return false;
      if (!ab.name) return false;
      // Only show abilities at least one seen Pokémon has
      if ((pokemonCountByAbility[ab.key] ?? 0) === 0) return false;
      if (searchTerm && !ab.name.toLowerCase().includes(searchTerm.toLowerCase())) return false;
      return true;
    });
    return sortAbilities(filtered, sortBy, pokemonCountByAbility);
  }, [abilitiesArray, searchTerm, sortBy, pokemonCountByAbility]);

  useEffect(() => {
    if (!id && filteredAbilities.length > 0) {
      navigate(`/abilities/${filteredAbilities[0].key}`, { replace: true });
    }
  }, [id, filteredAbilities, navigate]);

  useEffect(() => {
    if (id && filteredAbilities.length > 0 && !filteredAbilities.find((a) => a.key === id)) {
      navigate(`/abilities/${filteredAbilities[0].key}`, { replace: true });
    }
  }, [filteredAbilities, id, navigate]);

  return (
    <div className="abilities-page">
      <AbilityFilterBar
        searchTerm={searchTerm}
        setSearchTerm={setSearchTerm}
        sortBy={sortBy}
        setSortBy={setSortBy}
        totalCount={filteredAbilities.length}
      />
      <div className="abilities-page-content">
        <AbilitySidebar
          filteredAbilities={filteredAbilities}
          activeId={id}
          pokemonCountByAbility={pokemonCountByAbility}
        />
        <div className="abilities-detail-area">
          {id ? (
            <AbilityDetailPage pokemonArray={pokemonArray} />
          ) : (
            <div className="empty-selection">
              <h2>Select an Ability</h2>
              <p>
                {filteredAbilities.length === 0
                  ? 'No abilities match the current filters.'
                  : 'Click an ability in the list to view its details.'}
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
