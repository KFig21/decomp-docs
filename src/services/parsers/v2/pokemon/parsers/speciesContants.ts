/* eslint-disable @typescript-eslint/no-explicit-any */
import type { PokemonMap } from '../types';

export function parseSpeciesConstants(file: string): PokemonMap {
  const pokemon: PokemonMap = {};

  const regex = /^#define\s+(SPECIES_[A-Z0-9_]+)\s+\d+/gm;
  let match;

  while ((match = regex.exec(file))) {
    const key = match[1];

    pokemon[key] = {
      key,
      name: '',
      baseStats: {} as any,
      types: undefined,
      abilities: [],
      levelUpLearnset: [],
      tmhmLearnset: [],
      locations: [],
      trainers: [],
    };
  }

  return pokemon;
}
