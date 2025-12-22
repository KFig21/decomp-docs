/* eslint-disable @typescript-eslint/no-explicit-any */
import type { ParsedTrainer } from '../trainers/types';
import type { LocationMap } from './types';

export function resolveTrainerFromScript(
  script: string | null,
  trainers: Record<string, ParsedTrainer>,
): ParsedTrainer | null {
  if (!script) return null;

  // Route111_EventScript_Drew → TRAINER_DREW
  const match = script.match(/EventScript_([A-Za-z0-9_]+)/);
  if (!match) return null;

  const trainerKey = `TRAINER_${match[1].toUpperCase()}`;
  return trainers[trainerKey] ?? null;
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
