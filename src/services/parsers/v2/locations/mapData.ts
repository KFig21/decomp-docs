// decomp-docs/src/services/parsers/v2/locations/mapData.ts

/* eslint-disable @typescript-eslint/no-explicit-any */
import type { LocationMap } from './types';
import type { ParsedTrainer } from '../trainers/types';
import type { ParsedPokemon } from '../pokemon/types';
import {
  resolveItemFromScript,
  resolveTrainerFromObjectEvents,
  resolveTrainersFromScripts,
} from './utils';

export function attachMapData(
  map: LocationMap,
  mapJson: any,
  trainers: Record<string, ParsedTrainer>,
  items: Record<string, any>,
  pokemon: Record<string, ParsedPokemon>,
  locationRoot: string,
  scripts?: string,
  starters: string[] = [],
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
      // update location & map references for trainer
      trainer.location.locationKey = locationRoot;
      trainer.location.mapKey = map.name;
      trainer.isPlaced = true;
      continue;
    }

    // 🎁 ITEM BALLS
    if (obj.graphics_id === 'OBJ_EVENT_GFX_ITEM_BALL') {
      const item = resolveItemFromScript(obj.script, items);
      if (item) {
        map.items.push({
          item,
          x: obj.x,
          y: obj.y,
          source: 'item_ball',
          quantity: 1,
        });
      }
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

  // ---- SCRIPT-DRIVEN TRAINERS & EVENTS (ONCE PER MAP) ----
  if (scripts) {
    const scripted = resolveTrainersFromScripts(scripts, trainers);
    for (const trainer of scripted) {
      if (!map.trainers.some((t) => t.key === trainer.key)) {
        map.trainers.push(trainer);
        // update location & map references for trainer
        trainer.location.locationKey = locationRoot;
        trainer.location.mapKey = map.name;
        trainer.isPlaced = true;
      }
    }

    // Catch the ChooseStarter special event
    if (scripts.includes('special ChooseStarter')) {
      for (const speciesStr of starters) {
        const species = pokemon[speciesStr];
        // Only push if it doesn't already exist on this map
        if (species && !map.staticEncounters.some((e) => e.species.key === species.key)) {
          map.staticEncounters.push({ species, level: 5, method: 'Gift' });
        }
      }
    }

    // Parse setwildbattle (e.g., setwildbattle SPECIES_GROUDON, 70)
    const wildBattleRegex = /setwildbattle\s+(SPECIES_[A-Z0-9_]+)\s*,\s*(\d+)/g;
    let match;
    while ((match = wildBattleRegex.exec(scripts))) {
      const speciesStr = match[1];
      const level = parseInt(match[2], 10);
      const species = pokemon[speciesStr];
      if (species && !map.staticEncounters.some((e) => e.species.key === species.key)) {
        map.staticEncounters.push({ species, level, method: 'Interaction' });
      }
    }

    // Parse givemon (e.g., givemon SPECIES_TREECKO, 5)
    const givemonRegex = /givemon\s+(SPECIES_[A-Z0-9_]+)\s*,\s*(\d+)/g;
    while ((match = givemonRegex.exec(scripts))) {
      const speciesStr = match[1];
      const level = parseInt(match[2], 10);
      const species = pokemon[speciesStr];
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
        map.items.push({
          item,
          x: bg.x,
          y: bg.y,
          source: 'hidden_item',
        });
      }
    }
  }
}
