/* eslint-disable @typescript-eslint/no-explicit-any */
import type { LocationRoot } from './types';
import { parseMapGroups } from './mapGroups';
import { attachMapData } from './mapData';
import { parseWildEncounters } from './wildEncounters';
import { getFile } from '../utils';

export function parseLocations(
  files: Map<string, string>,
  items: Record<string, any>,
  trainers: Record<string, any>,
  pokemon: Record<string, any>, // 👈 required for wild encounters
): Record<string, LocationRoot> {
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

      // trainers / items / NPCs
      attachMapData(map, mapJson, trainers, items);

      // wild Pokémon
      const mapId = mapJson.id; // e.g. MAP_ROUTE111
      if (wildByMap[mapId]) {
        map.wildPokemon.push(...wildByMap[mapId]);
      }
    }
  }

  return locations;
}
