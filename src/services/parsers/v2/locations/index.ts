/* eslint-disable @typescript-eslint/no-explicit-any */
import type { LocationRoot } from './types';
import { parseMapGroups } from './mapGroups';
import { attachMapData } from './mapData';
import { parseWildEncounters } from './wildEncounters';
import { buildBerryTreeLookup } from './parseBerryTrees';
import { getFile } from '../utils';
import type { ParsedItem } from '../items/types';
import type { ParsedTrainer } from '../trainers/types';
import type { ParsedPokemon } from '../pokemon/types';
import { generateMapImage } from '../../../mapRenderer';
import type { FileContent } from '../../../fileReader';

export interface ParseLocationsResult {
  locations: Record<string, LocationRoot>;
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
  // 1. Layouts
  const layoutsRaw = getFile(files, 'data/layouts/layouts.json');
  const layoutsJson = layoutsRaw ? JSON.parse(layoutsRaw) : { layouts: [] };
  const layoutLookup = new Map<string, any>();
  for (const l of layoutsJson.layouts || []) layoutLookup.set(l.id, l);

  const raw = getFile(files, 'data/maps/map_groups.json');
  if (!raw) throw new Error('Missing map_groups.json');
  const locations = parseMapGroups(JSON.parse(raw));

  // 2. docs.config.json navigation allowlist
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

  // 3. Starters
  const starterChooseRaw = getFile(files, 'src/starter_choose.c');
  const starters: string[] = [];
  if (starterChooseRaw) {
    const regex = /#define\s+(?:GRASS|FIRE|WATER)_STARTER\s+(.*)/g;
    let match;
    while ((match = regex.exec(starterChooseRaw))) {
      const valStr = match[1].trim();
      if (valStr.includes('?')) {
        const condition = valStr.split('?')[0].replace(/[()]/g, '').trim();
        const trueBranch = valStr.split('?')[1].split(':')[0].replace(/[()]/g, '').trim();
        const falseBranch = valStr.split(':')[1].replace(/[()]/g, '').trim();
        if (condition === 'IS_FRLG') starters.push(falseBranch);
        else if (condition === 'IS_EMERALD') starters.push(trueBranch);
        else starters.push(falseBranch);
      } else {
        const speciesMatch = valStr.match(/SPECIES_[A-Z0-9_]+/);
        if (speciesMatch) starters.push(speciesMatch[0]);
      }
    }
  }
  if (starters.length === 0) starters.push('SPECIES_TREECKO', 'SPECIES_TORCHIC', 'SPECIES_MUDKIP');

  // 4. ── BUILD BERRY TREE LOOKUP (once, globally) ──
  // new_game.inc is the canonical source; fall back to any file containing setberrytree
  const newGameRaw =
    getFile(files, 'data/scripts/new_game.inc') ||
    getFile(files, 'data/scripts/NewGame.inc') ||
    // Some hacks put it elsewhere – scan all .inc files as last resort
    Array.from(files.entries())
      .filter(([p]) => p.endsWith('.inc') && typeof files.get(p) === 'string')
      .map(([, c]) => (typeof c === 'string' ? c : ''))
      .find((c) => c.includes('setberrytree')) ||
    '';

  const berryTreeLookup = buildBerryTreeLookup(newGameRaw);

  // 5. Wild encounters
  const wildRaw = getFile(files, 'src/data/wild_encounters.json');
  if (!wildRaw) throw new Error('Missing wild_encounters.json');
  const wildByMap = parseWildEncounters(JSON.parse(wildRaw), pokemon);

  let totalMaps = 0;
  for (const root of Object.values(locations)) totalMaps += Object.keys(root.maps).length;
  let processedMaps = 0;

  const scriptsByMap: Record<string, string> = {};

  // 6. Walk every map
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

      const mapRaw = getFile(files, `data/maps/${map.name}/map.json`);
      if (!mapRaw) continue;
      const mapJson = JSON.parse(mapRaw);

      const scriptsRaw = getFile(files, `data/maps/${map.name}/scripts.inc`);
      if (!scriptsRaw) continue;
      scriptsByMap[map.name] = scriptsRaw;

      const locationRoot = root.root;

      // ── Pass berryTreeLookup down ──
      attachMapData(
        map,
        mapJson,
        trainers,
        items,
        pokemon,
        locationRoot,
        scriptsRaw,
        starters,
        berryTreeLookup,
      );

      const mapId = mapJson.id;
      if (wildByMap[mapId]) {
        map.wildPokemon.push(...wildByMap[mapId]);

        // Derive HM events from encounter methods
        if (!map.hmEvents) map.hmEvents = [];
        for (const table of wildByMap[mapId]) {
          const m = table.method.toLowerCase();
          if ((m.includes('surf') || m.includes('water')) && !map.hmEvents.includes('surf')) {
            map.hmEvents.push('surf');
          }
          if ((m.includes('rod') || m.includes('fish')) && !map.hmEvents.includes('surf')) {
            map.hmEvents.push('surf');
          }
          if (m.includes('rock smash') && !map.hmEvents.includes('rock_smash')) {
            map.hmEvents.push('rock_smash');
          }
        }

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
        const base64Image = await generateMapImage(
          layoutLookup.get(mapJson.layout),
          files,
          mapJson,
        );
        if (base64Image) map.mapImage = base64Image;
      }
    }
  }

  // ── Post-process: compute root-level flags from all maps ────────────────────
  for (const root of Object.values(locations)) {
    root.hasGym = false;
    root.hasRival = false;

    for (const [mapName, map] of Object.entries(root.maps)) {
      // Gym: map name ends with _Gym / _GYM, OR any trainer class contains "gym" or is "Leader"
      if (
        /_(gym)$/i.test(mapName) ||
        map.trainers.some((t) => {
          const cls = t.trainerClass?.toLowerCase() ?? '';
          return cls.includes('gym') || cls === 'leader' || cls.includes('gym leader');
        })
      ) {
        root.hasGym = true;
      }

      // Rival: any trainer class contains "rival"
      if (map.trainers.some((t) => t.trainerClass?.toLowerCase().includes('rival'))) {
        root.hasRival = true;
      }
    }
  }

  return { locations, scriptsByMap };
}
