// v2/natures/index.ts

import type { FileContent } from '../../../fileReader';
import { getFile } from '../utils';
import { STAT_ORDER, type NatureStat, type ParsedNatures } from './types';

const NATURE_ROW_REGEX =
  /\[\s*(NATURE_[A-Z0-9_]+)\s*\]\s*=\s*\{\s*([+-]?\d+)\s*,\s*([+-]?\d+)\s*,\s*([+-]?\d+)\s*,\s*([+-]?\d+)\s*,\s*([+-]?\d+)\s*\}/g;

type Args = {
  files: Map<string, FileContent>;
};

export function parseNatures({ files }: Args): ParsedNatures {
  const file = getFile(files, 'src/pokemon.c');
  if (!file) return {};

  const result: ParsedNatures = {};
  let match: RegExpExecArray | null;

  while ((match = NATURE_ROW_REGEX.exec(file))) {
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

  return result;
}
