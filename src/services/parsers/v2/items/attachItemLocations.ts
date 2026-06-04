// decomp-docs/src/services/parsers/v2/items/attachItemLocations.ts
//
// Merges ALL item location sources into item.locations[]:
//
//   overworld  – item ball objects on the map
//   hidden     – bg_event hidden_item tiles
//   mart       – sold at a PokéMart counter  (.2byte lists in scripts.inc)
//   npc        – given directly by an NPC    (giveitem / additem commands)
//
// Wild held items are NOT stored in item.locations – they live on
// item.wildHolders[] (attached by attachWildHeldItems in heldItems.ts)
// because they're Pokemon-centric, not map-centric.
//
// The ItemLocation type is extended with the new methods below.

/* eslint-disable @typescript-eslint/no-explicit-any */
import type { ItemLocation } from './types';
import type { LocationRoot } from '../locations/types';
import { parseMartItems } from '../locations/parseMartItems';
import { parseNpcItems } from '../locations/parseNpcItems';

export function attachItemLocations(
  items: Record<string, any>,
  locations: Record<string, LocationRoot>,
  // Raw scripts map: mapName -> scripts.inc content
  // Pass this in from parseLocations where you already have it.
  scriptsByMap: Record<string, string>,
): void {
  // ─── 1. OVERWORLD + HIDDEN (existing logic, unchanged) ───────────────────
  // itemKey -> (dedupeKey -> ItemLocation)
  const byItem: Record<string, Record<string, ItemLocation>> = {};

  for (const locationRoot of Object.values(locations)) {
    for (const map of Object.values(locationRoot.maps)) {
      if (!map.items) continue;

      for (const itemEvent of map.items) {
        const itemKey = itemEvent.item?.key;
        if (!itemKey) continue;
        if (!byItem[itemKey]) byItem[itemKey] = {};

        const method: ItemLocation['method'] =
          itemEvent.source === 'hidden_item' ? 'hidden' : 'overworld';

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

  // ─── 2. MART + NPC GIFTS (new – scan scripts per map) ────────────────────
  for (const locationRoot of Object.values(locations)) {
    for (const map of Object.values(locationRoot.maps)) {
      const scripts = scriptsByMap[map.name];
      if (!scripts) continue;

      // --- Mart items ---
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
              quantity: 1, // sold items have no fixed qty
            };
          }
        }
      }

      // --- NPC gift items ---
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

  // ─── 3. Write merged locations back onto each item ────────────────────────
  for (const [itemKey, item] of Object.entries(items)) {
    const merged = byItem[itemKey];
    item.locations = merged ? Object.values(merged) : [];
  }
}
