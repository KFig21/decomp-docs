export function parseMapFolders(fileText: string): string[] {
  try {
    const parsed = JSON.parse(fileText);
    return parsed.gMapGroup_TownsAndRoutes ?? [];
  } catch {
    return [];
  }
}

export function prettyMapName(map: string) {
  return map
    .replace('MAP_', '')
    .replace(/_/g, ' ')
    .toLowerCase()
    .replace(/\b\w/g, (c) => c.toUpperCase());
}
