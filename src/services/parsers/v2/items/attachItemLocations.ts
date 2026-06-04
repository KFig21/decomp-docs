/* eslint-disable @typescript-eslint/no-explicit-any */
import type { ItemLocation } from './types';
import type { LocationRoot } from '../locations/types';
import { parseMartItems } from '../locations/parseMartItems';
import { parseNpcItems } from '../locations/parseNpcItems';

// Maps map.items[].source -> ItemLocation method
const SOURCE_TO_METHOD: Record<string, ItemLocation['method']> = {
  item_ball: 'overworld',
  hidden_item: 'hidden',
  npc: 'npc',
  berry_tree: 'berry_tree',
};

export function attachItemLocations(
  items: Record<string, any>,
  locations: Record<string, LocationRoot>,
  scriptsByMap: Record<string, string>,
): void {
  const byItem: Record<string, Record<string, ItemLocation>> = {};

  // ─── 1. OVERWORLD + HIDDEN + BERRY TREE (from map.items[]) ───────────────
  for (const locationRoot of Object.values(locations)) {
    for (const map of Object.values(locationRoot.maps)) {
      if (!map.items) continue;

      for (const itemEvent of map.items) {
        const itemKey = itemEvent.item?.key;
        if (!itemKey) continue;
        if (!byItem[itemKey]) byItem[itemKey] = {};

        const method: ItemLocation['method'] = SOURCE_TO_METHOD[itemEvent.source] ?? 'overworld';

        const dedupeKey = `${locationRoot.root}|${map.name}|${method}`;
        const existing = byItem[itemKey][dedupeKey];

        if (existing) {
          existing.quantity += itemEvent.quantity ?? 1;
        } else {
          byItem[itemKey][dedupeKey] = {
            location: locationRoot.root,
            map: map.name,
            method,
            quantity: itemEvent.quantity ?? 1,
          };
        }
      }
    }
  }

  // ─── 2. MART + NPC GIFTS (from scripts.inc) ───────────────────────────────
  for (const locationRoot of Object.values(locations)) {
    for (const map of Object.values(locationRoot.maps)) {
      const scripts = scriptsByMap[map.name];
      if (!scripts) continue;

      // Mart
      const martEntries = parseMartItems(scripts, map.name, locationRoot.root, items);
      for (const [itemKey, entries] of Object.entries(martEntries)) {
        if (!byItem[itemKey]) byItem[itemKey] = {};
        for (const entry of entries) {
          const dedupeKey = `${entry.locationRoot}|${entry.mapName}|mart`;
          if (!byItem[itemKey][dedupeKey]) {
            byItem[itemKey][dedupeKey] = {
              location: entry.locationRoot,
              map: entry.mapName,
              method: 'mart',
              quantity: 1,
            };
          }
        }
      }

      // NPC gifts
      const npcEntries = parseNpcItems(scripts, map.name, locationRoot.root, items);
      for (const [itemKey, entries] of Object.entries(npcEntries)) {
        if (!byItem[itemKey]) byItem[itemKey] = {};
        for (const entry of entries) {
          const dedupeKey = `${entry.locationRoot}|${entry.mapName}|npc`;
          const existing = byItem[itemKey][dedupeKey];
          if (existing) {
            existing.quantity += entry.quantity;
          } else {
            byItem[itemKey][dedupeKey] = {
              location: entry.locationRoot,
              map: entry.mapName,
              method: 'npc',
              quantity: entry.quantity,
            };
          }
        }
      }
    }
  }

  // ─── 3. Write back ────────────────────────────────────────────────────────
  for (const [itemKey, item] of Object.entries(items)) {
    const merged = byItem[itemKey];
    item.locations = merged ? Object.values(merged) : [];
  }
}
