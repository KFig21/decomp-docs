/* eslint-disable @typescript-eslint/no-explicit-any */
import type { ParsedTrainerPokemon, ParsedTrainerVariant } from './types';
import { getDefaultMoves } from './utils';

export function parseTrainerParties(
  file: string,
  partyKey: string,
  moves: Record<string, any>,
  items: Record<string, any>,
  pokemon: Record<string, any>,
  learnsetPtrs: string,
  learnsets: string,
  variant: ParsedTrainerVariant,
): ParsedTrainerPokemon[] {
  const partyRegex = new RegExp(`${partyKey}\\s*\\[\\s*\\]\\s*=\\s*\\{([\\s\\S]*?)\\n\\};`, 'm');

  const blockMatch = file.match(partyRegex);
  if (!blockMatch) return [];

  const monRegex = /\{([\s\S]*?)\}/g;
  const mons: ParsedTrainerPokemon[] = [];

  let monMatch;
  while ((monMatch = monRegex.exec(blockMatch[1]))) {
    const body = monMatch[1];

    const speciesString = body.match(/\.species\s*=\s*(SPECIES_[A-Z0-9_]+)/)?.[1];
    const species = speciesString ? pokemon[speciesString] : undefined;
    const level = Number(body.match(/\.lvl\s*=\s*(\d+)/)?.[1]);
    const iv = Number(body.match(/\.iv\s*=\s*(\d+)/)?.[1] ?? 0);
    // TODO: figure out how natures are determined, then add parsing. It looks really confusing
    // const natureString = body.match(/\.nature\s*=\s*(NATURE_[A-Z0-9_]+)/)?.[1];
    // const nature = natureString ? pokemon[natureString] : undefined;
    // console.log(nature);

    const heldItemKey = body.match(/\.heldItem\s*=\s*(ITEM_[A-Z0-9_]+)/)?.[1];

    // -----------------------------
    // Moves
    // -----------------------------
    let moveKeys: string[] = [];

    const movesMatch = body.match(/\.moves\s*=\s*\{([^}]+)\}/);
    if (movesMatch) {
      moveKeys = movesMatch[1]
        .split(',')
        .map((m) => m.trim())
        .filter(Boolean);
    } else {
      moveKeys = getDefaultMoves(speciesString!, level, learnsetPtrs, learnsets);
    }

    const resolvedMoves = moveKeys.map((key) => moves[key]).filter(Boolean);

    mons.push({
      species: species!,
      level,
      iv,
      heldItem: heldItemKey ? items[heldItemKey] : undefined,
      moves: resolvedMoves,
      // TODO: figure out how natures are determined, then add parsing. It looks really confusing
      nature: null,
    });

    // Add the trainer to the pokemons trainer reference
    if (speciesString) {
      pokemon[speciesString]?.trainers.push({
        trainerKey: variant.key,
      });
    }
  }

  return mons;
}
