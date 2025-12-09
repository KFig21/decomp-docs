import { useParams } from 'react-router-dom';
import type { Location } from '../types/decomp';

type Props = {
  locations: Location[];
};

export default function LocationDetailPage({ locations }: Props) {
  const { id } = useParams();

  const location = locations.find((l) => l.id === id);

  if (!location) return <div>Location not found</div>;

  return (
    <div className="p-6 max-w-5xl mx-auto">
      <h1 className="text-3xl font-bold mb-4">{location.name}</h1>

      <section className="mb-6">
        <h2 className="text-xl font-semibold">Trainers</h2>
        <ul>
          {location.trainers.map((t, i) => (
            <li key={i}>{t.name}</li>
          ))}
        </ul>
      </section>

      <section className="mb-6">
        <h2 className="text-xl font-semibold">Wild Pokémon</h2>
        <ul>
          {location.wildPokemon.map((p, i) => (
            <li key={i}>
              {p.species} — Lv {p.level}
            </li>
          ))}
        </ul>
      </section>

      <section className="mb-6">
        <h2 className="text-xl font-semibold">Items</h2>
        <ul>
          {location.items.map((i, idx) => (
            <li key={idx}>{i.name}</li>
          ))}
        </ul>
      </section>
    </div>
  );
}
