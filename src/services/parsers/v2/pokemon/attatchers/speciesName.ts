import type { PokemonMap } from '../types';

export function attachSpeciesNames(pokemon: PokemonMap, file: string) {
  const regex = /\[(SPECIES_[A-Z0-9_]+)\]\s*=\s*_\("([^"]+)"\)/g;

  let match;
  while ((match = regex.exec(file))) {
    const key = match[1];
    const name = match[2];

    if (pokemon[key]) {
      pokemon[key].name = name;
    }
  }
}
