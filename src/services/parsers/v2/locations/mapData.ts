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
import { resolveWeather } from '../weather';
import type { ParsedWeather } from '../weather/types';

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
  weathers: Record<string, ParsedWeather> = {},
) {
  map.trainers = [];
  map.items = [];
  map.npcs = [];
  map.wildPokemon = [];
  map.staticEncounters = [];
  map.hmEvents = [];
  map.hasMart = false;
  map.weathers = [];

  // ── Weather collection helper ──────────────────────────────────────────────
  const addWeather = (raw: string | undefined | null) => {
    const w = resolveWeather(raw, weathers);
    if (w && !map.weathers!.some((x) => x.key === w.key)) map.weathers!.push(w);
  };

  // ---- WEATHER SOURCE 1: top-level `weather` field ----
  addWeather(mapJson.weather);

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

  // ---- WEATHER SOURCE 2: coord_events with type "weather" ----
  for (const ce of mapJson.coord_events ?? []) {
    if (ce.type === 'weather') addWeather(ce.weather);
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

  // ---- FLASH ----
  if (mapJson.requires_flash) map.hmEvents!.push('flash');

  // ---- HM / FIELD-MOVE DETECTION ----
  // Collect all script name references from object events and bg events — these are
  // short strings like "Route101_EventScript_CutTree" and are very reliable signal
  // sources even when the full scripts.inc isn't loaded.
  const objScriptNames = ((mapJson.object_events ?? []) as any[])
    .map((o) => String(o.script ?? ''))
    .join(' ');
  const bgScriptNames = ((mapJson.bg_events ?? []) as any[])
    .map((b) => String(b.script ?? ''))
    .join(' ');
  // Collect graphics IDs for object-event-based HM objects (boulders, etc.)
  const graphicsIds = ((mapJson.object_events ?? []) as any[])
    .map((o) => String(o.graphics_id ?? ''))
    .join(' ');

  // Combine all text sources for a single-pass test per HM
  const allRefs = `${objScriptNames} ${bgScriptNames} ${graphicsIds}`;
  const allText = `${allRefs} ${scripts ?? ''}`;

  const has = (pattern: RegExp) => pattern.test(allText);

  // Cut: tree-clearing events or HM_CUT references in scripts
  if (has(/cut[_]?tree|CutTree|cutgrass|HM_CUT\b|HM_06\b/i)) {
    map.hmEvents!.push('cut');
  }
  // Waterfall: ascending waterfalls or HM_WATERFALL references
  if (has(/waterfall|HM_WATERFALL\b|HM_07\b/i)) {
    map.hmEvents!.push('waterfall');
  }
  // Strength: pushable boulders by graphics ID name or script name or HM reference
  if (has(/pushable[_]?boulder|strength[_]?boulder|OBJ_EVENT_GFX.*BOULDER|HM_STRENGTH\b|HM_04\b|moveboulder|pushboulder/i)) {
    map.hmEvents!.push('strength');
  }
  // Rock Smash: breakable rocks or HM reference (also added from encounter methods in index.ts)
  if (has(/rock[_]?smash|smash[_]?rock|breakable[_]?rock|HM_ROCK_SMASH\b|HM_06\b/i)) {
    if (!map.hmEvents!.includes('rock_smash')) map.hmEvents!.push('rock_smash');
  }
  // Dive: underwater dive points or HM reference
  if (has(/\bdive\b|\bdiving\b|DiveSpot|DivingSign|HM_DIVE\b|HM_08\b/i)) {
    map.hmEvents!.push('dive');
  }

  // Mart detection: scripts reference a mart/shop menu
  if (has(/pokemart|PokeMart|buymenu|BuyMenu|MartMenu/i)) {
    map.hasMart = true;
  }

  // ---- WEATHER SOURCE 3: setweather commands in scripts.inc ----
  if (scripts) {
    const setweatherRegex = /setweather\s+((?:WEATHER|COORD_EVENT_WEATHER)_[A-Z0-9_]+)/g;
    let wMatch: RegExpExecArray | null;
    while ((wMatch = setweatherRegex.exec(scripts))) {
      addWeather(wMatch[1]);
    }
  }
}
