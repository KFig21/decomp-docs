/* eslint-disable @typescript-eslint/no-explicit-any */
import type { tmhmLearnset } from '../types';

export function parseTMHMLearnsets(
  file: string,
  items: Record<string, any>,
  moves: Record<string, any>,
): Record<string, tmhmLearnset> {
  const result: Record<string, tmhmLearnset> = {};

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

      entries.push({
        tm: tmItem,
        move,
      });
    }

    result[speciesKey] = entries;
  }

  return result;
}
