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

  locations: ItemLocationRef[];
}
export type ItemLocation = {
  location: string;
  map: string;
  quantity: number;
  method: 'overworld' | 'hidden' | 'npc' | 'mart';
  //   repeatable: boolean; maybe add later
};
