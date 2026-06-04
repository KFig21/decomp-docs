// decomp-docs/src/services/parsers/v2/locations/parseNpcItems.ts
//
// Parses NPC-gifted items from map scripts.inc files.
//
// Relevant script commands:
//
//   giveitem  ITEM_BICYCLE           – gives item directly (no quantity arg)
//   giveitem  ITEM_POTION, 3         – gives item with quantity
//   additem   ITEM_POTION            – silent bag-add variant
//   giveitemfanfare ITEM_X_ATTACK    – gives item + plays fanfare
//
// We don't try to resolve *which* NPC gives it – that would require
// full script-graph tracing.  Instead we tag the item as coming from
// an NPC at this map, which is accurate and useful for docs.

import type { ParsedItem } from '../items/types';

export interface NpcItemEntry {
  locationRoot: string;
  mapName: string;
  command: string; // "giveitem" | "additem" | "giveitemfanfare"
  quantity: number;
}

/**
 * Returns itemKey -> NpcItemEntry[] for every NPC gift found in `scripts`.
 */
export function parseNpcItems(
  scripts: string,
  mapName: string,
  locationRoot: string,
  items: Record<string, ParsedItem>,
): Record<string, NpcItemEntry[]> {
  const result: Record<string, NpcItemEntry[]> = {};

  // Matches: giveitem / additem / giveitemfanfare  ITEM_FOO [, <qty>]
  // Intentionally loose with whitespace since minified scripts may have no spaces.
  const npcItemRegex = /\b(giveitem|additem|giveitemfanfare)\s+(ITEM_[A-Z0-9_]+)(?:\s*,\s*(\d+))?/g;
  let match: RegExpExecArray | null;

  while ((match = npcItemRegex.exec(scripts)) !== null) {
    const command = match[1];
    const itemKey = match[2];
    const quantity = match[3] ? parseInt(match[3], 10) : 1;

    if (!items[itemKey]) continue;

    if (!result[itemKey]) result[itemKey] = [];

    // Deduplicate: same command + map combo counts as one location
    const dedupeKey = `${locationRoot}|${mapName}|${command}`;
    const existing = result[itemKey].find(
      (e) => `${e.locationRoot}|${e.mapName}|${e.command}` === dedupeKey,
    );
    if (existing) {
      existing.quantity += quantity;
    } else {
      result[itemKey].push({ locationRoot, mapName, command, quantity });
    }
  }

  return result;
}
