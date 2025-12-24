import type { ParsedAbility } from '../abilities';
import type { ParsedItem } from '../items/types';
import type { ParsedAttack } from '../moves/types';

export type RawIdentifier = string;

export type LevelUpEntry = {
  lvl: number;
  move: ParsedAttack;
};

export type TMHMEntry = {
  tm: ParsedItem;
  move: ParsedAttack;
};

export type levelUpLearnset = LevelUpEntry[];
export type tmhmLearnset = TMHMEntry[];

export interface ParsedPokemon {
  key: RawIdentifier;

  name: string;

  baseStats: {
    hp: number;
    attack: number;
    defense: number;
    spAttack: number;
    spDefense: number;
    speed: number;
  };

  // TODO: Make a type for this
  types?: [RawIdentifier, RawIdentifier | null];
  abilities: ParsedAbility[];

  levelUpLearnset: levelUpLearnset;

  tmhmLearnset: tmhmLearnset;
}

export type PokemonMap = Record<RawIdentifier, ParsedPokemon>;
