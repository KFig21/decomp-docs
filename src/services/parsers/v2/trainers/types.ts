/* eslint-disable @typescript-eslint/no-explicit-any */

import type { ParsedItem } from '../items/types';
import type { ParsedAttack } from '../moves/types';

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
  items: ParsedItem[];
  doubleBattle: boolean;
  partyKey: string; // sParty_Vicky
  partyType: TrainerPartyType;
  party: ParsedTrainerPokemon[];
  sprite?: string;
}

export interface ParsedTrainerPokemon {
  species: string;
  level: number;
  iv: number;
  heldItem?: any; // ParsedItem
  moves: ParsedAttack[]; // ParsedMove[]
}
