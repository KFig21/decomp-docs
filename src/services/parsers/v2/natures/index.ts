import type { FileContent } from '../../../fileReader';
import { getFile } from '../utils';
import { STAT_ORDER, type NatureStat, type ParsedNatures } from './types';

type Args = { files: Map<string, FileContent> };

export function parseNatures({ files }: Args): ParsedNatures {
  const result: ParsedNatures = {};

  // 1. Try modern expansion format first
  const modernFile = getFile(files, 'src/data/natures_info.h');
  if (modernFile) {
    const blockRegex = /\[\s*(NATURE_[A-Z0-9_]+)\s*\]\s*=\s*\{([\s\S]*?)\n\s*\}/g;
    let match;

    while ((match = blockRegex.exec(modernFile))) {
      const key = match[1];
      const body = match[2];

      const nameMatch = body.match(/\.name\s*=\s*_\("([^"]+)"\)/);
      const statUpMatch = body.match(/\.statUpId\s*=\s*STAT_([A-Z]+)/);
      const statDownMatch = body.match(/\.statDownId\s*=\s*STAT_([A-Z]+)/);

      const statMap: Record<string, NatureStat> = {
        ATK: 'attack',
        DEF: 'defense',
        SPEED: 'speed',
        SPATK: 'spAttack',
        SPDEF: 'spDefense',
      };

      result[key] = {
        key,
        name: nameMatch ? nameMatch[1] : key.replace('NATURE_', ''),
        increasedStat: statUpMatch && statMap[statUpMatch[1]] ? statMap[statUpMatch[1]] : null,
        decreasedStat:
          statDownMatch && statMap[statDownMatch[1]] ? statMap[statDownMatch[1]] : null,
      };
    }
    return result;
  }

  // 2. Fallback to older legacy pokemon.c format
  const legacyFile = getFile(files, 'src/pokemon.c');
  if (legacyFile) {
    const NATURE_ROW_REGEX =
      /\[\s*(NATURE_[A-Z0-9_]+)\s*\]\s*=\s*\{\s*([+-]?\d+)\s*,\s*([+-]?\d+)\s*,\s*([+-]?\d+)\s*,\s*([+-]?\d+)\s*,\s*([+-]?\d+)\s*\}/g;
    let match;
    while ((match = NATURE_ROW_REGEX.exec(legacyFile))) {
      const [, key, atk, def, spd, spAtk, spDef] = match;
      const modifiers = [Number(atk), Number(def), Number(spd), Number(spAtk), Number(spDef)];
      let increasedStat: NatureStat | null = null;
      let decreasedStat: NatureStat | null = null;

      modifiers.forEach((value, index) => {
        if (value === 1) increasedStat = STAT_ORDER[index];
        if (value === -1) decreasedStat = STAT_ORDER[index];
      });

      result[key] = {
        key,
        name: key
          .replace('NATURE_', '')
          .toLowerCase()
          .replace(/_/g, ' ')
          .replace(/\b\w/g, (c) => c.toUpperCase()),
        increasedStat,
        decreasedStat,
      };
    }
  }

  return result;
}
