import { useParams } from 'react-router-dom';

export default function PokemonDetailPage() {
  const { id } = useParams();
  return <div>Pokémon Detail: {id}</div>;
}
