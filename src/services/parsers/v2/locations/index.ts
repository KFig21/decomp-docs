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
  files: Map<string, FileContent>, // Updated type
  items: Record<string, ParsedItem>,
  trainers: Record<string, ParsedTrainer>,
  pokemon: Record<string, ParsedPokemon>,
): Promise<Record<string, LocationRoot>> {
  // TEMPORARY: just a toggle to parse maps
  const generateMaps = true;

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

  // --- Wild encounters (parse once) ---
  const wildRaw = getFile(files, 'src/data/wild_encounters.json');
  if (!wildRaw) throw new Error('Missing wild_encounters.json');

  const wildJson = JSON.parse(wildRaw);
  const wildByMap = parseWildEncounters(wildJson, pokemon);

  // --- Walk every map ---
  for (const root of Object.values(locations)) {
    for (const map of Object.values(root.maps)) {
      const mapPath = `data/maps/${map.name}/map.json`;
      const mapRaw = getFile(files, mapPath);
      if (!mapRaw) continue;
      const mapJson = JSON.parse(mapRaw);

      const scriptsPath = `data/maps/${map.name}/scripts.inc`;
      const scriptsRaw = getFile(files, scriptsPath);
      if (!scriptsRaw) continue;

      const locationRoot = root.root;

      // trainers / items / NPCs
      attachMapData(map, mapJson, trainers, items, locationRoot, scriptsRaw);

      // wild Pokémon
      const mapId = mapJson.id; // e.g. MAP_ROUTE111
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
      }

      // only generate 1 map for now
      // if (map.name === 'RustboroCity') {
      // GENERATE MAP IMAGE
      if (generateMaps) {
        if (mapJson.layout && layoutLookup.has(mapJson.layout)) {
          const layoutInfo = layoutLookup.get(mapJson.layout);

          // Generate the image
          const base64Image = await generateMapImage(layoutInfo, files);

          if (base64Image) {
            map.mapImage = base64Image;
          }
        }
      }
      // }
    }
  }

  return locations;
}
