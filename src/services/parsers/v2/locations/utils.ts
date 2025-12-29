/* eslint-disable @typescript-eslint/no-explicit-any */
import type { ParsedTrainer, ParsedTrainerVariant } from '../trainers/types';
import type { LocationMap } from './types';

export function resolveTrainerFromObjectEvents(
  script: string | null,
  trainers: Record<string, ParsedTrainer>,
): ParsedTrainerVariant | null {
  if (!script) return null;

  // EventScript_Drew_1 → DREW_1
  const match = script.match(/EventScript_([A-Za-z0-9_]+)/);
  if (!match) return null;

  const scriptKey = match[1].toUpperCase();

  // Search ALL variants
  for (const trainer of Object.values(trainers)) {
    for (const variant of trainer.variants) {
      const enumKey = variant.key.replace(/^TRAINER_/, '');

      // Exact match
      if (enumKey === scriptKey) {
        return variant;
      }

      // Fallback: script omits suffix (_1, _2, etc)
      if (enumKey.startsWith(scriptKey + '_')) {
        return variant;
      }
    }
  }

  return null;
}

// This function looks for eventscripts from triggers that precede trainer battles
export function resolveTrainersFromScripts(
  scripts: string,
  trainers: Record<string, ParsedTrainer>,
): ParsedTrainerVariant[] {
  const found: ParsedTrainerVariant[] = [];

  const battleRegex = /trainerbattle[\s\S]*?(TRAINER_[A-Z0-9_]+)/g;

  let match: RegExpExecArray | null;
  while ((match = battleRegex.exec(scripts))) {
    const trainerKey = match[1];

    for (const trainer of Object.values(trainers)) {
      const variant = trainer.variants.find((v) => v.key === trainerKey);
      if (variant && !found.some((f) => f.key === variant.key)) {
        found.push(variant);
      }
    }
  }

  return found;
}

export function resolveItemFromScript(script: string | null, items: Record<string, any>) {
  if (!script) return null;

  // Route111_EventScript_ItemSitrusBerry2
  const match = script.match(/Item([A-Za-z0-9_]+)/);
  if (!match) return null;

  const itemKey = `ITEM_${match[1].toUpperCase()}`;
  return items[itemKey] ?? null;
}

export function getRootName(mapName: string): string {
  // DewfordTown_House1 → DewfordTown
  // Route111_WinstrateHouse → Route111
  return mapName.split('_')[0];
}

export function createEmptyLocationMap(
  name: string,
  type: 'outdoor' | 'indoor' | 'special' | 'dungeon' | 'other',
): LocationMap {
  return {
    name,
    type,
    trainers: [],
    items: [],
    npcs: [],
    wildPokemon: [],
  };
}
