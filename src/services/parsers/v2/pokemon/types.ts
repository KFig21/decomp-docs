/* eslint-disable @typescript-eslint/no-explicit-any */
export type RawIdentifier = string;

export type LevelUpEntry = {
  lvl: number;
  move: any; // ParsedMove TODO MAKE A TYPE FOR THIS
};

export type TMHMEntry = {
  tm: any; // ParsedItem (TM or HM)
  move: any; // ParsedMove TODO MAKE A TYPE FOR THIS
};
export type levelUpLearnset = LevelUpEntry[];
export type tmhmLearnset = TMHMEntry[];

export interface ParsedPokemon {
  key: RawIdentifier;

  name: string;

  baseStats?: {
    hp?: number;
    attack?: number;
    defense?: number;
    spAttack?: number;
    spDefense?: number;
    speed?: number;
  };

  types?: [RawIdentifier, RawIdentifier | null];
  abilities?: RawIdentifier[];

  levelUpLearnset?: levelUpLearnset;

  tmhmLearnset?: tmhmLearnset;
}

export type PokemonMap = Record<RawIdentifier, ParsedPokemon>;
