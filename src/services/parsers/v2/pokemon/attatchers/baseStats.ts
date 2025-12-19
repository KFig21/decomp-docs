import type { PokemonMap } from '../types';

export function attachBaseStats(pokemon: PokemonMap, file: string) {
  const blockRegex = /\[(SPECIES_[A-Z0-9_]+)\]\s*=\s*\{([\s\S]*?)\},/g;

  let block;
  while ((block = blockRegex.exec(file))) {
    const species = block[1];
    const body = block[2];

    if (!pokemon[species]) continue;

    const read = (key: string) => Number(body.match(new RegExp(`\\.${key}\\s*=\\s*(\\d+)`))?.[1]);

    const type1 = body.match(/\.type1\s*=\s*(TYPE_[A-Z_]+)/)?.[1];
    const type2 = body.match(/\.type2\s*=\s*(TYPE_[A-Z_]+)/)?.[1] ?? null;

    const abilities =
      body
        .match(/\.abilities\s*=\s*\{([^}]+)\}/)?.[1]
        ?.split(',')
        .map((s) => s.trim())
        .filter((s) => s.startsWith('ABILITY_')) ?? [];

    pokemon[species].baseStats = {
      hp: read('baseHP'),
      attack: read('baseAttack'),
      defense: read('baseDefense'),
      spAttack: read('baseSpAttack'),
      spDefense: read('baseSpDefense'),
      speed: read('baseSpeed'),
    };

    pokemon[species].types = [type1!, type2];
    pokemon[species].abilities = abilities;
  }
}
