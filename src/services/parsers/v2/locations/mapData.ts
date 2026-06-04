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
  // ── NEW: pass in the pre-built berry-tree lookup ──
  berryTreeLookup: Map<string, string> = new Map(),
) {
  map.trainers = [];
  map.items = [];
  map.npcs = [];
  map.wildPokemon = [];
  map.staticEncounters = [];

  // ---- OBJECT EVENTS ----
  for (const obj of mapJson.object_events ?? []) {
    // 🎯 OBJECT-BOUND TRAINERS
    const trainer = resolveTrainerFromObjectEvents(obj.script, trainers);
    if (trainer) {
      map.trainers.push(trainer);
      trainer.location.locationKey = locationRoot;
      trainer.location.mapKey = map.name;
      trainer.isPlaced = true;
      continue;
    }

    // 🎁 ITEM BALLS
    if (obj.graphics_id === 'OBJ_EVENT_GFX_ITEM_BALL') {
      const item = resolveItemFromScript(obj.script, items);
      if (item) {
        map.items.push({ item, x: obj.x, y: obj.y, source: 'item_ball', quantity: 1 });
      }
      continue;
    }

    // 🫐 BERRY TREES – resolved separately below (after loop)
    if (obj.graphics_id === 'OBJ_EVENT_GFX_BERRY_TREE') {
      continue; // handled in batch below
    }

    // 🧍 NPCs
    if (obj.trainer_type === 'TRAINER_TYPE_NONE') {
      map.npcs.push({
        graphics: obj.graphics_id,
        x: obj.x,
        y: obj.y,
        script: obj.script !== 'NULL' ? obj.script : null,
      });
    }
  }

  // 🫐 Resolve all berry trees for this map in one pass
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

    // Starters
    if (scripts.includes('special ChooseStarter')) {
      for (const speciesStr of starters) {
        const species = pokemon[speciesStr];
        if (species && !map.staticEncounters.some((e) => e.species.key === species.key)) {
          map.staticEncounters.push({ species, level: 5, method: 'Gift' });
        }
      }
    }

    // setwildbattle
    const wildBattleRegex = /setwildbattle\s+(SPECIES_[A-Z0-9_]+)\s*,\s*(\d+)/g;
    let match;
    while ((match = wildBattleRegex.exec(scripts))) {
      const species = pokemon[match[1]];
      const level = parseInt(match[2], 10);
      if (species && !map.staticEncounters.some((e) => e.species.key === species.key)) {
        map.staticEncounters.push({ species, level, method: 'Interaction' });
      }
    }

    // givemon
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
