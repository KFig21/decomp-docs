/* eslint-disable @typescript-eslint/no-explicit-any */
import type { LocationMap } from './types';
import type { ParsedTrainer } from '../trainers/types';
import { resolveItemFromScript, resolveTrainerFromScript } from './utils';

export function attachMapData(
  map: LocationMap,
  mapJson: any,
  trainers: Record<string, ParsedTrainer>,
  items: Record<string, any>,
) {
  // Initialize containers
  map.trainers = [];
  map.items = [];
  map.npcs = [];
  map.wildPokemon = [];

  // ---- OBJECT EVENTS ----
  for (const obj of mapJson.object_events ?? []) {
    // 🎯 TRAINERS
    if (obj.trainer_type !== 'TRAINER_TYPE_NONE') {
      const trainer = resolveTrainerFromScript(obj.script, trainers);
      if (trainer) {
        map.trainers.push(trainer);
      }
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
          // TODO: determine if quantity can vary
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

  // ---- BG EVENTS (hidden items) ----
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
