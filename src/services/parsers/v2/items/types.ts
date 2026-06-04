export type RawIdentifier = string;

export interface ItemLocationRef {
  mapScript: string;
}

export interface ParsedItem {
  key: RawIdentifier;
  name: string;
  price?: number;
  pocket?: RawIdentifier;
  type?: string | RawIdentifier;
  holdEffect?: RawIdentifier;
  description?: RawIdentifier;
  fieldUseFunc?: RawIdentifier;
  battleUsage?: RawIdentifier;
  battleUseFunc?: RawIdentifier;
  flingPower?: number;
  secondaryId?: string;

  /** Map/overworld/NPC/mart locations where this item can be obtained */
  locations: ItemLocationRef[];

  /**
   * Wild Pokémon that hold this item.
   * Populated by attachWildHeldItems() in heldItems.ts.
   */
  wildHolders?: WildHolderRef[];

  isPlaced?: boolean;
}

export interface WildHolderRef {
  speciesKey: string;
  chance: 'common' | 'uncommon' | 'rare';
}

export type ItemLocation = {
  location: string; // LocationRoot key  e.g. "MauvilleCity"
  map: string; // LocationMap key   e.g. "MauvilleCity_Mart"
  quantity: number;
  method: 'overworld' | 'hidden' | 'npc' | 'mart';
  // repeatable?: boolean;  // may add later
};
