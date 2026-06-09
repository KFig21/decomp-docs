/* eslint-disable @typescript-eslint/no-explicit-any */
import { useParams } from 'react-router-dom';
import { useData } from '../../contexts/dataContext';
import AbilityHeaderCard from './components/abilityHeaderCard/AbilityHeaderCard';
import AbilityPokemonList from './components/abilityPokemonList/AbilityPokemonList';

type Props = { pokemonArray: any[] };

export default function AbilityDetailPage({ pokemonArray }: Props) {
  const { id } = useParams<{ id: string }>();
  const { abilities } = useData();

  const selected = (abilities as Record<string, any>)[id ?? ''];
  if (!selected) return <div className="abilities-detail-pane">Ability not found.</div>;

  return (
    <div className="abilities-detail-pane">
      <AbilityHeaderCard ability={selected} />
      <AbilityPokemonList abilityKey={selected.key} pokemonArray={pokemonArray} />
    </div>
  );
}
