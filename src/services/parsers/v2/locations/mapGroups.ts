import type { LocationRoot, MapGroupsJson, LocationMap } from './types';
import { getRootName, createEmptyLocationMap } from './utils';

function getMapType(groupName: string): LocationMap['type'] {
  if (groupName.includes('TownsAndRoutes')) return 'outdoor';
  if (groupName.includes('Indoor')) return 'indoor';
  if (groupName.includes('Dungeons')) return 'dungeon';
  if (groupName.includes('SpecialArea')) return 'special';
  return 'other';
}

export function parseMapGroups(mapGroups: MapGroupsJson): Record<string, LocationRoot> {
  const locations: Record<string, LocationRoot> = {};

  for (const [groupName, maps] of Object.entries(mapGroups)) {
    if (!Array.isArray(maps)) continue;

    const mapType = getMapType(groupName);

    for (const mapName of maps) {
      const root = getRootName(mapName);

      if (!locations[root]) {
        locations[root] = {
          root,
          maps: {},
        };
      }

      locations[root].maps[mapName] = createEmptyLocationMap(mapName, mapType);
    }
  }

  return locations;
}
