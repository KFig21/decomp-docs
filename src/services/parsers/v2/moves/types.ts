export type RawIdentifier = string;

export interface ParsedAttack {
  key: RawIdentifier;
  name: string;
  power?: number;
  accuracy?: number;
  pp?: number;
  priority?: number;
  secondaryEffectChance?: number;
  type?: RawIdentifier;
  effect?: RawIdentifier;
  target?: RawIdentifier;
  split?: RawIdentifier;
  flags?: RawIdentifier[];
}
