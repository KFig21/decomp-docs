// decomp-docs/src/services/parsers/v2/locations/index.ts
//
// CHANGES FROM ORIGINAL:
//   • Collects every map's scripts.inc content into `scriptsByMap`
//   • Returns it alongside `locations` so the top-level orchestrator
//     can pass it to attachItemLocations()

/* eslint-disable @typescript-eslint/no-explicit-any */
import type { LocationRoot } from './types';
import { parseMapGroups } from './mapGroups';
import { attachMapData } from './mapData';
import { parseWildEncounters } from './wildEncounters';
import { getFile } from '../utils';
import type { ParsedItem } from '../items/types';
import type { ParsedTrainer } from '../trainers/types';
import type { ParsedPokemon } from '../pokemon/types';
import { generateMapImage } from '../../../mapRenderer';
import type { FileContent } from '../../../fileReader';

export interface ParseLocationsResult {
  locations: Record<string, LocationRoot>;
  /** mapName -> raw scripts.inc text – used later by attachItemLocations */
  scriptsByMap: Record<string, string>;
}

export async function parseLocations(
  files: Map<string, FileContent>,
  items: Record<string, ParsedItem>,
  trainers: Record<string, ParsedTrainer>,
  pokemon: Record<string, ParsedPokemon>,
  renderMaps: boolean,
  onProgress?: (text: string, percent: number) => void,
  progressStart: number = 70,
  progressEnd: number = 95,
  checkCancel?: () => boolean,
): Promise<ParseLocationsResult> {
  // 1. Load Layouts JSON
  const layoutsRaw = getFile(files, 'data/layouts/layouts.json');
  const layoutsJson = layoutsRaw ? JSON.parse(layoutsRaw) : { layouts: [] };

  const layoutLookup = new Map<string, any>();
  for (const l of layoutsJson.layouts || []) layoutLookup.set(l.id, l);

  const raw = getFile(files, 'data/maps/map_groups.json');
  if (!raw) throw new Error('Missing map_groups.json');
  const mapGroups = JSON.parse(raw);
  const locations = parseMapGroups(mapGroups);

  // docs.config.json navigation allowlist (unchanged)
  const configRaw = getFile(files, 'docs.config.json');
  const customConfig = configRaw ? JSON.parse(configRaw) : null;

  if (customConfig?.navigation && Array.isArray(customConfig.navigation)) {
    customConfig.navigation.forEach((rootName: string, index: number) => {
      if (locations[rootName]) locations[rootName].order = index;
    });
    for (const root of Object.keys(locations)) {
      if (locations[root].order === undefined) delete locations[root];
    }
  }

  // ==========================================
  // EXTRACT STARTER POKEMON
  // ==========================================
  const starterChooseRaw = getFile(files, 'src/starter_choose.c');
  const starters: string[] = [];

  if (starterChooseRaw) {
    const regex = /#define\s+(?:GRASS|FIRE|WATER)_STARTER\s+(.*)/g;
    let match;
    while ((match = regex.exec(starterChooseRaw))) {
      const valStr = match[1].trim();

      // Handle ternary operator: (CONDITION ? TRUE_VAL : FALSE_VAL)
      if (valStr.includes('?')) {
        const condition = valStr.split('?')[0].replace(/[()]/g, '').trim();
        const trueBranch = valStr.split('?')[1].split(':')[0].replace(/[()]/g, '').trim();
        const falseBranch = valStr.split(':')[1].replace(/[()]/g, '').trim();

        // If the condition asks if it's FRLG, we want the false branch (Emerald)
        // If it asks if it's Emerald, we want the true branch
        if (condition === 'IS_FRLG') {
          starters.push(falseBranch);
        } else if (condition === 'IS_EMERALD') {
          starters.push(trueBranch);
        } else {
          // Default fallback just in case
          starters.push(falseBranch);
        }
      } else {
        // Normal define without a ternary
        const speciesMatch = valStr.match(/SPECIES_[A-Z0-9_]+/);
        if (speciesMatch) {
          starters.push(speciesMatch[0]);
        }
      }
    }
  }

  // Fallback just in case
  if (starters.length === 0) {
    starters.push('SPECIES_TREECKO', 'SPECIES_TORCHIC', 'SPECIES_MUDKIP');
  }

  // Wild encounters
  const wildRaw = getFile(files, 'src/data/wild_encounters.json');
  if (!wildRaw) throw new Error('Missing wild_encounters.json');
  const wildByMap = parseWildEncounters(JSON.parse(wildRaw), pokemon);

  let totalMaps = 0;
  for (const root of Object.values(locations)) totalMaps += Object.keys(root.maps).length;
  let processedMaps = 0;

  // ─── collect scripts per map ────────────────────────────────────────
  const scriptsByMap: Record<string, string> = {};

  for (const root of Object.values(locations)) {
    for (const map of Object.values(root.maps)) {
      if (checkCancel?.()) throw new Error('CANCELLED');

      if (onProgress) {
        const range = progressEnd - progressStart;
        const percentage = progressStart + (processedMaps / totalMaps) * range;
        onProgress(`Parsing map: ${map.name}`, percentage);
        await new Promise((resolve) => setTimeout(resolve, 0));
      }
      processedMaps++;

      const mapPath = `data/maps/${map.name}/map.json`;
      const mapRaw = getFile(files, mapPath);
      if (!mapRaw) continue;
      const mapJson = JSON.parse(mapRaw);
      const scriptsPath = `data/maps/${map.name}/scripts.inc`;
      const scriptsRaw = getFile(files, scriptsPath);
      if (!scriptsRaw) continue;

      // ── Store for later use in attachItemLocations ──
      scriptsByMap[map.name] = scriptsRaw;

      const locationRoot = root.root;

      // 🚀 Pass starters down here!
      attachMapData(map, mapJson, trainers, items, pokemon, locationRoot, scriptsRaw, starters);

      const mapId = mapJson.id;

      if (wildByMap[mapId]) {
        map.wildPokemon.push(...wildByMap[mapId]);

        for (const table of wildByMap[mapId]) {
          for (const encounter of table.encounters) {
            const mon = encounter.pokemon;
            if (!mon) continue;
            const exists = mon.locations.some(
              (loc: any) => loc.locationKey === locationRoot && loc.mapKey === mapId,
            );
            if (!exists) mon.locations.push({ locationKey: locationRoot, mapKey: mapId });
          }
        }

        for (const enc of map.staticEncounters) {
          const mon = enc.species;
          if (!mon) continue;
          const exists = mon.locations.some(
            (loc: any) => loc.locationKey === locationRoot && loc.mapKey === mapId,
          );
          if (!exists) mon.locations.push({ locationKey: locationRoot, mapKey: mapId });
        }
      }

      const onlyGenerateOneMap = false;
      const isTestMap = map.name === 'PetalburgCity_Gym' || map.name === 'PetalburgCity';
      const shouldRenderMap = renderMaps && (!onlyGenerateOneMap || isTestMap);

      if (shouldRenderMap && mapJson.layout && layoutLookup.has(mapJson.layout)) {
        const layoutInfo = layoutLookup.get(mapJson.layout);
        const base64Image = await generateMapImage(layoutInfo, files, mapJson);
        if (base64Image) map.mapImage = base64Image;
      }
    }
  }

  return { locations, scriptsByMap };
}
