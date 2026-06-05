// decomp-docs/src/services/parsers/v2/obtainability.ts
//
// CHANGES FROM ORIGINAL:
//   markItemsPlaced() now takes the parsed `locations` record and uses it
//   as a whitelist. An item is only counted as "placed" if at least one of
//   its locations refers to a LocationRoot that made it through the
//   docs.config.json navigation filter.  This prevents FRLG / unincluded
//   items from leaking into the items sidebar.
//
/* eslint-disable @typescript-eslint/no-explicit-any */
import type { FileContent } from '../../fileReader';
import type { LocationRoot } from './locations/types';

export function markPokemonObtainable(pokemon: any, trainers: any) {
  const visitedFamilies = new Set<string>();

  const markFamilyAsObtainable = (speciesKey: string) => {
    if (visitedFamilies.has(speciesKey)) return;
    visitedFamilies.add(speciesKey);
    const mon = pokemon[speciesKey];
    if (!mon) return;
    mon.isObtainable = true;
    (mon.evolutions || []).forEach((evo: any) => markFamilyAsObtainable(evo.targetSpecies));
    (mon.preEvolutions || []).forEach(markFamilyAsObtainable);
  };

  for (const mon of Object.values(pokemon) as any[]) {
    const isSeenFromTrainer = (mon.trainers || []).some((tRef: any) => {
      for (const tGroup of Object.values(trainers) as any[]) {
        const v = (tGroup as any).variants.find((variant: any) => variant.key === tRef.trainerKey);
        if (v && v.isPlaced) return true;
      }
      return false;
    });

    mon.isSeen = (mon.locations && mon.locations.length > 0) || isSeenFromTrainer;
    if (mon.locations && mon.locations.length > 0) {
      markFamilyAsObtainable(mon.key);
    }
  }
}

export function markItemsPlaced(
  items: any,
  pokemon: any,
  trainers: any,
  files: Map<string, FileContent>,
  // NEW: the fully-filtered locations record from parseLocations()
  // Only roots present here are valid in-game locations.
  locations: Record<string, LocationRoot>,
) {
  // Pre-build a Set of valid location root keys for O(1) lookup.
  const validRoots = new Set(Object.keys(locations));

  // ── 1. Map Data ────────────────────────────────────────────────────────────
  // An item is placed if it has at least one location whose `location` field
  // (the LocationRoot key) is in the validated set.
  for (const item of Object.values(items) as any[]) {
    const locs: any[] = item.locations ?? [];
    item.isPlaced = locs.some((loc) => {
      // item.locations entries are ItemLocation objects: { location, map, method, quantity }
      // The `location` field is the LocationRoot key (e.g. "MauvilleCity").
      return validRoots.has(loc.location);
    });
  }

  // ── 2. Trainers ────────────────────────────────────────────────────────────
  // Trainer-held items: only count if the trainer is placed in a valid location.
  for (const tGroup of Object.values(trainers) as any[]) {
    for (const variant of (tGroup as any).variants) {
      if (!variant.isPlaced) continue;

      // Check that the trainer's location root is valid too
      if (!validRoots.has(variant.location?.locationKey)) continue;

      variant.items?.forEach((i: any) => {
        if (i && items[i.key]) items[i.key].isPlaced = true;
      });
      variant.party?.forEach((mon: any) => {
        if (mon.heldItem && items[mon.heldItem.key]) items[mon.heldItem.key].isPlaced = true;
      });
    }
  }

  // ── 3. Wild Pokémon ────────────────────────────────────────────────────────
  // Only mark held items of pokemon that are themselves seen/obtainable.
  for (const mon of Object.values(pokemon) as any[]) {
    if (!mon.isSeen && !mon.isObtainable) continue;
    (mon.wildItems || mon.heldItems || []).forEach((hi: any) => {
      const key = typeof hi === 'string' ? hi : (hi.item?.key ?? hi.item);
      if (key && items[key]) items[key].isPlaced = true;
    });
  }

  // ── 4. Scripts ─────────────────────────────────────────────────────────────
  // REMOVED the blanket script scan — it was the main source of FRLG leakage.
  // The overworld/hidden/npc/mart data already covers everything we need from
  // scripts because attachItemLocations already walked every script in the
  // validated location tree.
}
