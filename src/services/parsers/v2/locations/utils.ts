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

      // Fallback: script omits suffix, but the trainer has a NUMBERED suffix (_1, _2)
      // FIX: Using regex ^..._[0-9]+$ prevents EventScript_Fisherman from hijacking FISHERMAN_CHIP
      if (enumKey.match(new RegExp(`^${scriptKey}_[0-9]+$`))) {
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

  // FIX: Use [^\n]*? instead of [\s\S]*? to strictly prevent regex bleeding across newlines
  const battleRegex = /trainerbattle[^\n]*?(TRAINER_[A-Z0-9_]+)/g;

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

export function getRootName(mapName: string, groupName: string): string {
  // If the group has an FRLG suffix, we force the root to include it.
  // This cleanly separates "VictoryRoad" (Emerald) from "VictoryRoad_Frlg" (Kanto)
  if (groupName.endsWith('_Frlg')) {
    return `${mapName.split('_')[0]}_Frlg`;
  }
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
    staticEncounters: [],
  };
}
