/* eslint-disable @typescript-eslint/no-explicit-any */
import type { LocationMap } from './types';
import type { ParsedTrainer } from '../trainers/types';
import type { ParsedPokemon } from '../pokemon/types';
import {
  resolveItemFromScript,
  resolveTrainerFromObjectEvents,
  resolveTrainersFromScripts,
} from './utils';
import { resolveBerryTreeItems } from './parseBerryTrees';

export function attachMapData(
  map: LocationMap,
  mapJson: any,
  trainers: Record<string, ParsedTrainer>,
  items: Record<string, any>,
  pokemon: Record<string, ParsedPokemon>,
  locationRoot: string,
  scripts?: string,
  starters: string[] = [],
  berryTreeLookup: Map<string, string> = new Map(),
) {
  map.trainers = [];
  map.items = [];
  map.npcs = [];
  map.wildPokemon = [];
  map.staticEncounters = [];

  // ---- OBJECT EVENTS ----
  for (const obj of mapJson.object_events ?? []) {
    // TRAINERS
    const trainer = resolveTrainerFromObjectEvents(obj.script, trainers);
    if (trainer) {
      map.trainers.push(trainer);
      trainer.location.locationKey = locationRoot;
      trainer.location.mapKey = map.name;
      trainer.isPlaced = true;
      continue;
    }

    // ITEM BALLS
    // The decomp uses two patterns:
    //   A) Custom script:  "Route111_EventScript_ItemSitrusBerry2"
    //      resolveItemFromScript extracts item key from the script name
    //   B) Generic script: "Common_EventScript_FindItem"
    //      trainer_sight_or_berry_tree_id = "ITEM_POTION"  ← item key stored directly
    if (obj.graphics_id === 'OBJ_EVENT_GFX_ITEM_BALL') {
      let item = resolveItemFromScript(obj.script, items);

      if (!item) {
        const directKey = obj.trainer_sight_or_berry_tree_id;
        if (typeof directKey === 'string' && directKey.startsWith('ITEM_')) {
          item = items[directKey] ?? null;
        }
      }

      if (item) {
        map.items.push({ item, x: obj.x, y: obj.y, source: 'item_ball', quantity: 1 });
      }
      continue;
    }

    // BERRY TREES – resolved in batch below
    if (obj.graphics_id === 'OBJ_EVENT_GFX_BERRY_TREE') {
      continue;
    }

    // NPCs
    if (obj.trainer_type === 'TRAINER_TYPE_NONE') {
      map.npcs.push({
        graphics: obj.graphics_id,
        x: obj.x,
        y: obj.y,
        script: obj.script !== 'NULL' ? obj.script : null,
      });
    }
  }

  // Berry trees in one pass
  if (berryTreeLookup.size > 0) {
    const berryItems = resolveBerryTreeItems(mapJson.object_events ?? [], berryTreeLookup, items);
    map.items.push(...berryItems);
  }

  // ---- SCRIPT-DRIVEN TRAINERS & EVENTS ----
  if (scripts) {
    const scripted = resolveTrainersFromScripts(scripts, trainers);
    for (const trainer of scripted) {
      if (!map.trainers.some((t) => t.key === trainer.key)) {
        map.trainers.push(trainer);
        trainer.location.locationKey = locationRoot;
        trainer.location.mapKey = map.name;
        trainer.isPlaced = true;
      }
    }

    if (scripts.includes('special ChooseStarter')) {
      for (const speciesStr of starters) {
        const species = pokemon[speciesStr];
        if (species && !map.staticEncounters.some((e) => e.species.key === species.key)) {
          map.staticEncounters.push({ species, level: 5, method: 'Gift' });
        }
      }
    }

    const wildBattleRegex = /setwildbattle\s+(SPECIES_[A-Z0-9_]+)\s*,\s*(\d+)/g;
    let match;
    while ((match = wildBattleRegex.exec(scripts))) {
      const species = pokemon[match[1]];
      const level = parseInt(match[2], 10);
      if (species && !map.staticEncounters.some((e) => e.species.key === species.key)) {
        map.staticEncounters.push({ species, level, method: 'Interaction' });
      }
    }

    const givemonRegex = /givemon\s+(SPECIES_[A-Z0-9_]+)\s*,\s*(\d+)/g;
    while ((match = givemonRegex.exec(scripts))) {
      const species = pokemon[match[1]];
      const level = parseInt(match[2], 10);
      if (species && !map.staticEncounters.some((e) => e.species.key === species.key)) {
        map.staticEncounters.push({ species, level, method: 'Gift' });
      }
    }
  }

  // ---- BG EVENTS ----
  for (const bg of mapJson.bg_events ?? []) {
    if (bg.type === 'hidden_item') {
      const item = items[bg.item];
      if (item) {
        map.items.push({ item, x: bg.x, y: bg.y, source: 'hidden_item' });
      }
    }
  }
}
