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
): Promise<Record<string, LocationRoot>> {
  // 1. Load Layouts JSON to link Map IDs to Binary Files
  const layoutsRaw = getFile(files, 'data/layouts/layouts.json');
  const layoutsJson = layoutsRaw ? JSON.parse(layoutsRaw) : { layouts: [] };

  // Create a quick lookup: LayoutID -> LayoutData
  const layoutLookup = new Map<string, any>();
  for (const l of layoutsJson.layouts || []) {
    layoutLookup.set(l.id, l);
  }

  const raw = getFile(files, 'data/maps/map_groups.json');
  if (!raw) throw new Error('Missing map_groups.json');
  const mapGroups = JSON.parse(raw);
  const locations = parseMapGroups(mapGroups);

  // ==========================================
  // NEW: APPLY DOCS CONFIG (STRICT ALLOWLIST & ORDER)
  // ==========================================
  const configRaw = getFile(files, 'docs.config.json');
  const customConfig = configRaw ? JSON.parse(configRaw) : null;

  if (customConfig && customConfig.navigation && Array.isArray(customConfig.navigation)) {
    // 1. Assign sorting order based on array index
    customConfig.navigation.forEach((rootName: string, index: number) => {
      if (locations[rootName]) {
        locations[rootName].order = index;
      }
    });

    // 2. STRICT ALLOWLIST: Delete any location that wasn't in the navigation array
    for (const root of Object.keys(locations)) {
      if (locations[root].order === undefined) {
        delete locations[root];
      }
    }
  }
  // ==========================================

  // --- Wild encounters (parse once) ---
  const wildRaw = getFile(files, 'src/data/wild_encounters.json');
  if (!wildRaw) throw new Error('Missing wild_encounters.json');
  const wildJson = JSON.parse(wildRaw);
  const wildByMap = parseWildEncounters(wildJson, pokemon);

  let totalMaps = 0;
  for (const root of Object.values(locations)) {
    totalMaps += Object.keys(root.maps).length;
  }

  let processedMaps = 0;

  // --- Walk every map ---
  for (const root of Object.values(locations)) {
    for (const map of Object.values(root.maps)) {
      if (checkCancel?.()) throw new Error('CANCELLED'); // <-- Bail out early

      // Update progress using the dynamic bounds
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

      const locationRoot = root.root;

      // trainers / items / NPCs
      attachMapData(map, mapJson, trainers, items, pokemon, locationRoot, scriptsRaw);

      const mapId = mapJson.id;
      // wild Pokémon
      if (wildByMap[mapId]) {
        map.wildPokemon.push(...wildByMap[mapId]);
        // loop through each pokemon and update their location reference
        // loop through each encounter table (land, water, fishing, etc)
        for (const table of wildByMap[mapId]) {
          for (const encounter of table.encounters) {
            const mon = encounter.pokemon;
            if (!mon) continue;
            // avoid duplicate entries
            const exists = mon.locations.some(
              (loc) => loc.locationKey === locationRoot && loc.mapKey === mapId,
            );
            if (!exists) {
              mon.locations.push({
                locationKey: locationRoot,
                mapKey: mapId,
              });
            }
          }
        }

        // Attach Static Encounters (Gifts/Legendaries) to the Pokemon's locations!
        for (const enc of map.staticEncounters) {
          const mon = enc.species;
          if (!mon) continue;
          const exists = mon.locations.some(
            (loc) => loc.locationKey === locationRoot && loc.mapKey === mapId,
          );
          if (!exists) {
            mon.locations.push({
              locationKey: locationRoot,
              mapKey: mapId,
            });
          }
        }
      }

      // For test purposes, quickly generate 1 map
      // IMPORTANT: True = only petalburg will generate a map
      const onlyGenerateOneMap = false;

      // Determine if we should proceed with rendering this specific map
      const isTestMap = map.name === 'PetalburgCity_Gym' || map.name === 'PetalburgCity';
      const shouldRenderMap = renderMaps && (!onlyGenerateOneMap || isTestMap);

      // GENERATE MAP IMAGE
      if (shouldRenderMap && mapJson.layout && layoutLookup.has(mapJson.layout)) {
        const layoutInfo = layoutLookup.get(mapJson.layout);
        const base64Image = await generateMapImage(layoutInfo, files, mapJson);

        if (base64Image) {
          map.mapImage = base64Image;
        }
      }
    }
  }

  return locations;
}
