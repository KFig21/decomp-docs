// decomp-docs/src/services/parsers/v2/pokemon/attatchers/heldItems.ts
//
// Reads wild held-item fields from species_info .h files and attaches
// them to the matching ParsedItem records.
//
// The three fields in the decomp are:
//
//   .itemCommon   = ITEM_POTION      – 50 % chance when using Thief / Pickup
//   .itemUncommon = ITEM_ORAN_BERRY  – 5 % chance  (used in some hacks/gens)
//   .itemRare     = ITEM_REVIVE      – 5 % chance  (or 1 % in some formulas)
//
// Emerald expansion only uses .itemCommon and .itemRare in most families,
// but we handle all three so it works for every fork.
//
// What we add to each ParsedItem:
//   item.wildHolders.push({ speciesKey, chance: 'common' | 'uncommon' | 'rare' })
//
// And we add to each ParsedPokemon:
//   mon.heldItems = [{ item, chance }]   (replaces the old plain abilities array)

/* eslint-disable @typescript-eslint/no-explicit-any */

export type HeldItemChance = 'common' | 'uncommon' | 'rare';

export interface WildHeldItemRef {
  speciesKey: string;
  chance: HeldItemChance;
}

export interface PokemonHeldItemRef {
  item: any; // ParsedItem – typed as any to avoid circular imports
  chance: HeldItemChance;
}

const FIELD_TO_CHANCE: Record<string, HeldItemChance> = {
  itemCommon: 'common',
  itemUncommon: 'uncommon',
  itemRare: 'rare',
};

/**
 * Call this after parsePokemon() and parseItems() are both complete.
 *
 * @param pokemon  – the full pokemon record from parsePokemon()
 * @param items    – the full items record from parseItems()
 * @param files    – raw file map (we scan all species_info files)
 */
export function attachWildHeldItems(
  pokemon: Record<string, any>,
  items: Record<string, any>,
  speciesInfoContent: string, // pass the concatenated species_info file content
): void {
  // We re-scan the species info blocks to pull out held-item fields.
  // The block boundaries mirror what parsePokemon() already uses.
  const matches = [...speciesInfoContent.matchAll(/\[\s*(SPECIES_[A-Z0-9_]+)\s*\]\s*=\s*\{/g)];

  for (let i = 0; i < matches.length; i++) {
    const speciesKey = matches[i][1];
    const mon = pokemon[speciesKey];
    if (!mon) continue;

    const start = matches[i].index! + matches[i][0].length;
    const end = i + 1 < matches.length ? matches[i + 1].index! : speciesInfoContent.length;
    const body = speciesInfoContent.slice(start, end);

    const heldItems: PokemonHeldItemRef[] = [];

    for (const [field, chance] of Object.entries(FIELD_TO_CHANCE)) {
      const fieldMatch = body.match(new RegExp(`\\.${field}\\s*=\\s*(ITEM_[A-Z0-9_]+)`));
      if (!fieldMatch) continue;

      const itemKey = fieldMatch[1];
      const item = items[itemKey];
      if (!item) continue;

      // Attach to pokemon
      heldItems.push({ item, chance });

      // Attach back-reference to item
      if (!item.wildHolders) item.wildHolders = [];
      const alreadyLinked = item.wildHolders.some(
        (r: WildHeldItemRef) => r.speciesKey === speciesKey && r.chance === chance,
      );
      if (!alreadyLinked) {
        item.wildHolders.push({ speciesKey, chance });
      }
    }

    if (heldItems.length > 0) {
      mon.heldItems = heldItems;
    }
  }
}
