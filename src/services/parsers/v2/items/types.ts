// decomp-docs/src/services/parsers/v2/items/types.ts

export type RawIdentifier = string;

/**
 * Canonical bag pocket categories, independent of which decomp constants
 * are used (vanilla vs expansion pockets differ slightly).
 */
export type PocketCategory = 'items' | 'balls' | 'tms' | 'berries' | 'key-items';

export interface ItemLocationRef {
  mapScript: string;
}

export interface ParsedItem {
  key: RawIdentifier;
  name: string;

  /** Buy price in Pokédollars (₽). 0 = not sold / key item. */
  price?: number;
  /** Sell price = Math.floor(price / 2). Always derived, never parsed. */
  sellPrice?: number;

  /** Raw decomp pocket constant, e.g. POCKET_BERRIES */
  pocket?: RawIdentifier;
  /** Normalised category for filtering */
  pocketCategory?: PocketCategory;

  type?: string | RawIdentifier;
  holdEffect?: RawIdentifier;
  description?: RawIdentifier;
  fieldUseFunc?: RawIdentifier;
  battleUsage?: RawIdentifier;
  battleUseFunc?: RawIdentifier;
  flingPower?: number;
  secondaryId?: string;

  locations: ItemLocationRef[];
  wildHolders?: WildHolderRef[];
  isPlaced?: boolean;
}

export interface WildHolderRef {
  speciesKey: string;
  chance: 'common' | 'uncommon' | 'rare';
}

export type ItemLocation = {
  location: string;
  map: string;
  quantity: number;
  method: 'overworld' | 'hidden' | 'npc' | 'mart' | 'berry_tree';
};
