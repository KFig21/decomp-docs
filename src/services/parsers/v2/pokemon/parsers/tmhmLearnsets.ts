/* eslint-disable @typescript-eslint/no-explicit-any */
import type { tmhmLearnset } from '../types';
import type { FileContent } from '../../../../fileReader';
import { getFile } from '../../utils';

export function parseTMHMLearnsets(
  files: Map<string, FileContent>,
  items: Record<string, any>,
  moves: Record<string, any>,
): Record<string, tmhmLearnset> {
  const result: Record<string, tmhmLearnset> = {};

  // 1. EXPANSION PARSING (JSON FORMAT)
  const learnablesJsonFile = getFile(files, 'src/data/pokemon/all_learnables.json');
  if (learnablesJsonFile) {
    try {
      const learnables = JSON.parse(learnablesJsonFile);

      // Get Universal moves if they exist
      let universalMoves: string[] = [];
      const specialMovesetsFile = getFile(files, 'src/data/pokemon/special_movesets.json');
      if (specialMovesetsFile) {
        const special = JSON.parse(specialMovesetsFile);
        universalMoves = special.universalMoves || [];
      }

      for (const [speciesRaw, moveArray] of Object.entries(learnables)) {
        const speciesKey = `SPECIES_${speciesRaw}`;
        const entries: tmhmLearnset = [];

        // Combine explicit learnables with universal moves, removing duplicates
        const allMoves = Array.from(new Set([...(moveArray as string[]), ...universalMoves]));

        for (const moveKey of allMoves) {
          const move = moves[moveKey];
          if (move) {
            // Expansion doesn't map to a specific item here, so tm is omitted
            entries.push({ move });
          }
        }
        result[speciesKey] = entries;
      }
      return result;
    } catch (e) {
      console.error('[Parser] Failed to parse learnables JSON', e);
    }
  }

  // 2. VANILLA PARSING (.H FORMAT FALLBACK)
  const file = getFile(files, 'src/data/pokemon/tmhm_learnsets.h');
  if (!file) return result;

  const speciesBlockRegex = /\[\s*(SPECIES_[A-Z0-9_]+)\s*\]\s*=\s*TMHM_LEARNSET\(([\s\S]*?)\),/g;
  let speciesMatch;

  while ((speciesMatch = speciesBlockRegex.exec(file))) {
    const [, speciesKey, body] = speciesMatch;
    const entries: tmhmLearnset = [];
    const tmRegex = /TMHM\(\s*(TM\d+_[A-Z0-9_]+|HM\d+_[A-Z0-9_]+)\s*\)/g;
    let tmMatch;

    while ((tmMatch = tmRegex.exec(body))) {
      const tmAttack = tmMatch[1]; // TM26_EARTHQUAKE
      const itemKey = `ITEM_${tmAttack}`;
      const moveKey = `MOVE_${tmAttack.split('_').slice(1).join('_')}`;

      const tmItem = items[itemKey];
      const move = moves[moveKey];

      if (!tmItem || !move) continue;

      entries.push({ tm: tmItem, move });
    }
    result[speciesKey] = entries;
  }

  return result;
}
