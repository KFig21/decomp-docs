// decomp-docs/src/services/parsers/v2/locations/parseBerryTrees.ts
//
// Berry trees in the decomp work across three files:
//
//   map.json          – object_events with graphics_id "OBJ_EVENT_GFX_BERRY_TREE"
//                       trainer_sight_or_berry_tree_id = "BERRY_TREE_ROUTE_102_ORAN"
//
//   data/scripts/new_game.inc  – setberrytree commands that bind tree IDs to items:
//                       setberrytree BERRY_TREE_ROUTE_102_ORAN, ITEM_TO_BERRY(ITEM_ORAN_BERRY), ...
//
// Strategy:
//   1. Parse new_game.inc once → Map<treeId, itemKey>
//   2. Per map, find all OBJ_EVENT_GFX_BERRY_TREE objects
//   3. Resolve treeId → itemKey → ParsedItem
//   4. Push onto map.items with source = 'berry_tree'

import type { ParsedItem } from '../items/types';
import type { ParsedMapItem } from './types';

/**
 * Step 1 – parse the global new_game.inc (or any script that calls setberrytree).
 * Returns a lookup of  BERRY_TREE_* -> ITEM_*_BERRY  (item key, not berry index).
 *
 * setberrytree BERRY_TREE_ROUTE_102_ORAN, ITEM_TO_BERRY(ITEM_ORAN_BERRY), BERRY_STAGE_BERRIES
 */
export function buildBerryTreeLookup(newGameScript: string): Map<string, string> {
  const lookup = new Map<string, string>();

  // Matches both spaced and minified variants
  const regex =
    /setberrytree\s+(BERRY_TREE_[A-Z0-9_]+)\s*,\s*ITEM_TO_BERRY\s*\(\s*(ITEM_[A-Z0-9_]+)\s*\)/g;
  let match: RegExpExecArray | null;

  while ((match = regex.exec(newGameScript)) !== null) {
    const treeId = match[1];
    const itemKey = match[2];
    lookup.set(treeId, itemKey);
  }

  return lookup;
}

/**
 * Step 2+3+4 – given a parsed map.json object_events array, find all berry
 * trees and resolve them to ParsedMapItem entries.
 *
 * @param objectEvents  – mapJson.object_events
 * @param treeToItem    – output of buildBerryTreeLookup()
 * @param items         – full items record
 */
export function resolveBerryTreeItems(
  objectEvents: Array<{
    graphics_id: string;
    x: number;
    y: number;
    trainer_sight_or_berry_tree_id: string;
  }>,
  treeToItem: Map<string, string>,
  items: Record<string, ParsedItem>,
): ParsedMapItem[] {
  const result: ParsedMapItem[] = [];

  for (const obj of objectEvents) {
    if (obj.graphics_id !== 'OBJ_EVENT_GFX_BERRY_TREE') continue;

    const treeId = obj.trainer_sight_or_berry_tree_id;
    const itemKey = treeToItem.get(treeId);
    if (!itemKey) continue;

    const item = items[itemKey];
    if (!item) continue;

    result.push({
      item,
      x: obj.x,
      y: obj.y,
      source: 'berry_tree',
      quantity: 1,
    });
  }

  return result;
}
