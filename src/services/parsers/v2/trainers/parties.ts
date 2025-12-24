/* eslint-disable @typescript-eslint/no-explicit-any */
import type { ParsedTrainerPokemon } from './types';
import { getDefaultMoves } from './utils';

export function parseTrainerParties(
  file: string,
  partyKey: string,
  moves: Record<string, any>,
  items: Record<string, any>,
  pokemon: Record<string, any>,
  learnsetPtrs: string,
  learnsets: string,
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
    });
  }

  return mons;
}
