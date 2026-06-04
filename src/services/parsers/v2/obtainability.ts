/* eslint-disable @typescript-eslint/no-explicit-any */
import type { FileContent } from '../../fileReader';

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
) {
  // 1. Map Data
  for (const item of Object.values(items) as any[]) {
    item.isPlaced = item.locations && item.locations.length > 0;
  }

  // 2. Trainers
  for (const tGroup of Object.values(trainers) as any[]) {
    for (const variant of (tGroup as any).variants) {
      if (variant.isPlaced) {
        variant.items?.forEach((i: any) => {
          if (i && items[i.key]) items[i.key].isPlaced = true;
        });
        variant.party?.forEach((mon: any) => {
          if (mon.heldItem && items[mon.heldItem.key]) items[mon.heldItem.key].isPlaced = true;
        });
      }
    }
  }

  // 3. Wild Pokémon
  for (const mon of Object.values(pokemon) as any[]) {
    if (mon.isSeen || mon.isObtainable) {
      (mon.wildItems || mon.heldItems || []).forEach((hi: any) => {
        const key = typeof hi === 'string' ? hi : hi.item;
        if (key && items[key]) items[key].isPlaced = true;
      });
    }
  }

  // 4. Scripts
  const scriptFiles = Array.from(files.entries())
    .filter(([path]) => path.endsWith('.inc') || path.endsWith('.s'))
    .map(([, content]) => (typeof content === 'string' ? content : ''));

  const scriptItemRegex = /(?:giveitem|additem|finditem|\.2byte)\s+(ITEM_[A-Z0-9_]+)/g;
  for (const scriptContent of scriptFiles) {
    let match;
    while ((match = scriptItemRegex.exec(scriptContent))) {
      if (items[match[1]]) items[match[1]].isPlaced = true;
    }
  }
}
