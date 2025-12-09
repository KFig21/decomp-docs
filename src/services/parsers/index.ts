import type { Location } from '../../types/decomp';
import { getFile } from './utils';
import { parseMapFolders, prettyMapName } from './mapParser';
import { parseTrainers } from './trainerParser';
import { parseWildPokemon } from './encounterParser';
import { parseItems } from './itemParser';

export function parseDecomp(files: Map<string, string>): Location[] {
  const locations: Location[] = [];

  const mapGroups = getFile(files, 'data/maps/map_groups.json');
  if (!mapGroups) return [];

  const mapFolders = parseMapFolders(mapGroups);

  for (const mapName of mapFolders) {
    const mapConst = 'MAP_' + mapName.toUpperCase().replace(/[^A-Z0-9]/g, '_');
    const basePath = `data/maps/${mapName}`;

    const mapJson = getFile(files, `${basePath}/map.json`);
    const scriptsInc = getFile(files, `${basePath}/scripts.inc`);

    if (!mapJson) continue;

    const parsedMap = JSON.parse(mapJson);

    const location: Location = {
      id: mapConst,
      name: prettyMapName(mapConst),
      trainers: [],
      wildPokemon: [],
      items: [],
    };

    parseTrainers({
      location,
      parsedMap,
      scriptsInc,
      files,
    });

    parseWildPokemon({
      location,
      mapConst,
      files,
    });

    parseItems({
      location,
      parsedMap,
      files,
    });

    locations.push(location);
  }

  return locations;
}
