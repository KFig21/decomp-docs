/* eslint-disable @typescript-eslint/no-explicit-any */
import type { levelUpLearnset } from '../types';

export function parseLevelUpLearnsets(
  moves: Record<string, any>,
  file: string,
): Record<string, levelUpLearnset> {
  const learnsets: Record<string, levelUpLearnset> = {};

  const blockRegex =
    /static const struct LevelUpMove\s+(s\w+LevelUpLearnset)\[\]\s*=\s*\{([\s\S]*?)\};/g;

  let blockMatch;
  while ((blockMatch = blockRegex.exec(file))) {
    const [, learnsetName, body] = blockMatch;

    const entries: levelUpLearnset = [];

    const moveRegex = /LEVEL_UP_MOVE\(\s*(\d+)\s*,\s*(MOVE_[A-Z0-9_]+)\s*\)/g;
    let moveMatch;

    while ((moveMatch = moveRegex.exec(body))) {
      const lvl = Number(moveMatch[1]);
      const moveKey = moveMatch[2];

      const move = moves[moveKey];
      if (!move) continue;

      entries.push({ lvl, move });
    }

    learnsets[learnsetName] = entries;
  }

  return learnsets;
}

// Maps species constants to their level-up learnset pointer names

export function parseLearnsetPointers(file: string): Record<string, string> {
  const map: Record<string, string> = {};

  const regex = /\[\s*(SPECIES_[A-Z0-9_]+)\s*\]\s*=\s*(s\w+LevelUpLearnset)/g;

  let match;
  while ((match = regex.exec(file))) {
    const [, speciesKey, learnsetName] = match;
    map[speciesKey] = learnsetName;
  }

  return map;
}
