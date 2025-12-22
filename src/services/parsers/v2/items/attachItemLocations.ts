/* eslint-disable @typescript-eslint/no-explicit-any */
import type { ItemLocation } from './types';
import type { LocationRoot } from '../locations/types';

export function attachItemLocations(
  items: Record<string, any>,
  locations: Record<string, LocationRoot>,
) {
  // itemKey -> (dedupeKey -> ItemLocation)
  const newLocationsByItem: Record<string, Record<string, ItemLocation>> = {};

  for (const locationRoot of Object.values(locations)) {
    for (const map of Object.values(locationRoot.maps)) {
      if (!map.items) continue;

      for (const itemEvent of map.items) {
        const itemKey = itemEvent.item?.key;
        if (!itemKey) continue;

        if (!newLocationsByItem[itemKey]) {
          newLocationsByItem[itemKey] = {};
        }

        const method: ItemLocation['method'] =
          itemEvent.item.source === 'hidden_item' ? 'hidden' : 'overworld';

        const entryBase = {
          location: locationRoot.root,
          map: map.name,
          method,
        };

        const dedupeKey = `${entryBase.location}|${entryBase.map}|${entryBase.method}`;

        const existing = newLocationsByItem[itemKey][dedupeKey];

        if (existing) {
          existing.quantity += itemEvent.quantity ?? 1;
        } else {
          newLocationsByItem[itemKey][dedupeKey] = {
            ...entryBase,
            quantity: itemEvent.quantity ?? 1,
          };
        }
      }
    }
  }

  // Replace item.locations with merged results
  for (const [itemKey, item] of Object.entries(items)) {
    const merged = newLocationsByItem[itemKey];
    item.locations = merged ? Object.values(merged) : [];
  }
}
