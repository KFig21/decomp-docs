import { useParams } from 'react-router-dom';
import { useData } from '../../contexts/dataContext';

export default function PokemonDetailPage() {
  const { pokemon } = useData();
  const { id } = useParams<{ id: string }>();
  const selected = pokemon.find((p) => p.key.toString() === id);

  if (!selected) return <div>Pokémon not found!</div>;

  return (
    <div className="pokemon-detail-page">
      <h1>{selected.name}</h1>
      <p>Type: {selected.types?.join(', ') || 'Unknown'}</p>
      <p>Base Stats:</p>
      <ul>
        {selected.baseStats &&
          Object.entries(selected.baseStats).map(([key, value]) => (
            <li key={key}>
              {key}: {value}
            </li>
          ))}
      </ul>
    </div>
  );
}
