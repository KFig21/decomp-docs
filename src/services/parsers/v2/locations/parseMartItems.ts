// decomp-docs/src/services/parsers/v2/locations/parseMartItems.ts
//
// Parses pokemart item lists from map scripts.inc files.
//
// The format in scripts.inc looks like:
//
//   pokemartMauvilleCity_Mart_Pokemart
//   ...
//   MauvilleCity_Mart_Pokemart:
//   .2byte ITEM_POKE_BALL
//   .2byte ITEM_GREAT_BALL
//   pokemartlistend
//
// The `pokemart <Label>` command is the trigger; the label that follows
// is where the actual item list lives.  We grab every .2byte entry
// between the label and `pokemartlistend`.

import type { ParsedItem } from '../items/types';

export interface MartEntry {
  locationRoot: string; // e.g. "MauvilleCity"
  mapName: string; // e.g. "MauvilleCity_Mart"
  scriptLabel: string; // e.g. "MauvilleCity_Mart_Pokemart"
}

/**
 * Scan every map's scripts.inc for pokemart item lists.
 * Returns a map of  itemKey -> MartEntry[]  so the caller can
 * merge them into item.locations just like attachItemLocations does.
 */
export function parseMartItems(
  scripts: string,
  mapName: string,
  locationRoot: string,
  items: Record<string, ParsedItem>,
): Record<string, MartEntry[]> {
  const result: Record<string, MartEntry[]> = {};

  // 1. Find every "pokemart <Label>" invocation in the script
  //    (the label tells us which list to read)
  const pokemartRefRegex = /\bpokemart\s+([A-Za-z0-9_]+)/g;
  let refMatch: RegExpExecArray | null;

  while ((refMatch = pokemartRefRegex.exec(scripts)) !== null) {
    const listLabel = refMatch[1];

    // 2. Find the matching label and collect .2byte entries until
    //    `pokemartlistend` (or end of file as a safety net)
    const listBodyRegex = new RegExp(`${listLabel}\\s*:([\\s\\S]*?)(?:pokemartlistend|$)`);
    const listMatch = scripts.match(listBodyRegex);
    if (!listMatch) continue;

    const body = listMatch[1];
    const itemRefRegex = /\.2byte\s+(ITEM_[A-Z0-9_]+)/g;
    let itemMatch: RegExpExecArray | null;

    while ((itemMatch = itemRefRegex.exec(body)) !== null) {
      const itemKey = itemMatch[1];
      if (!items[itemKey]) continue; // unknown item – skip

      if (!result[itemKey]) result[itemKey] = [];

      result[itemKey].push({
        locationRoot,
        mapName,
        scriptLabel: listLabel,
      });
    }
  }

  return result;
}
