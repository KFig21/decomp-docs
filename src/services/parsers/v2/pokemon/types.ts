import type { ParsedAbility } from '../abilities';
import type { ParsedItem } from '../items/types';
import type { ParsedAttack } from '../moves/types';

export type RawIdentifier = string;

export type LevelUpEntry = {
  lvl: number;
  move: ParsedAttack;
};

export type TMHMEntry = {
  tm?: ParsedItem;
  move: ParsedAttack;
};

export type levelUpLearnset = LevelUpEntry[];
export type tmhmLearnset = TMHMEntry[];

export type PokemonLocationRef = {
  locationKey: string;
  mapKey: string;
};

export type PokemonTrainerRef = {
  trainerKey: string;
};

export type EvolutionInfo = {
  method: string;
  param: string;
  targetSpecies: RawIdentifier;
};

export interface ParsedPokemon {
  key: RawIdentifier;
  name: string;
  pokedexEntry?: string;
  natDexNum?: string | number;
  baseSpeciesKey?: string;
  variants?: ParsedPokemon[];

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

  locations: PokemonLocationRef[];
  trainers: PokemonTrainerRef[];

  evolutions: EvolutionInfo[];
  preEvolutions: RawIdentifier[];
  isObtainable?: boolean;
  isSeen?: boolean;
}

export type PokemonMap = Record<RawIdentifier, ParsedPokemon>;
