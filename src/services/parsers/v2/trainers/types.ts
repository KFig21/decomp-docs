/* eslint-disable @typescript-eslint/no-explicit-any */
// v2/trainers/types.ts
export type TrainerPartyType =
  | 'NoItemDefaultMoves'
  | 'ItemDefaultMoves'
  | 'NoItemCustomMoves'
  | 'ItemCustomMoves';

export interface ParsedTrainer {
  key: string; // TRAINER_VICKY
  name: string;
  trainerClass: string;
  trainerPic: string;
  items: string[];
  doubleBattle: boolean;
  partyKey: string; // sParty_Vicky
  partyType: TrainerPartyType;
  party: ParsedTrainerPokemon[];
}

export interface ParsedTrainerPokemon {
  species: string;
  level: number;
  iv: number;
  heldItem?: any; // ParsedItem
  moves: any[]; // ParsedMove[]
}
