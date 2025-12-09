import { POKEMON_MAP } from '../../../utils/pokemon';

type Props = {
  name: string;
  size?: number;
};

export default function PokemonSprite({ name, size = 48 }: Props) {
  // normalize the name
  let safeName = name.toLowerCase().replace('species_', '').replaceAll('_', '');
  // capitalize first letter
  safeName = safeName.charAt(0).toUpperCase() + safeName.slice(1);

  const pokemonId = POKEMON_MAP[safeName] ?? 0; // fallback to 0 if not found

  const src = `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/${pokemonId}.png`;

  return (
    <img
      src={src}
      alt={name}
      width={size}
      height={size}
      loading="lazy"
      onError={(e) => {
        // fallback if sprite doesn't exist
        (e.target as HTMLImageElement).src =
          'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/0.png';
      }}
    />
  );
}
