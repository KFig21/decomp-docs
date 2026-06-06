export type RawIdentifier = string;

export interface AdditionalEffect {
  effect: string;
  label: string;
  chance?: number;
}

export interface ParsedAttack {
  key: RawIdentifier;
  name: string;
  description?: string;
  power?: number;
  accuracy?: number;
  pp?: number;
  priority?: number;
  secondaryEffectChance?: number;
  type?: RawIdentifier;
  effect?: RawIdentifier;
  target?: RawIdentifier;
  split?: RawIdentifier;
  category?: RawIdentifier;
  /** Boolean flags parsed as TRUE in the struct (e.g. makesContact, soundMove) */
  booleanFlags?: Set<string>;
  /** Legacy pipe-separated flags from older .flags = FLAG_A | FLAG_B format */
  legacyFlags?: string[];
  /** Additional effects with optional chance%, from ADDITIONAL_EFFECTS({...}) */
  additionalEffects?: AdditionalEffect[];
}
