/* eslint-disable @typescript-eslint/no-explicit-any */
import type { ParsedTrainer } from '../trainers/types';

export type LocationMap = {
  name: string;
  type: 'outdoor' | 'indoor' | 'special' | 'dungeon' | 'other';

  trainers: ParsedTrainer[];
  items: ParsedMapItem[];
  npcs: ParsedNpc[];
  wildPokemon: WildEncounterTable[]; // stub for now
};

export type LocationRoot = {
  root: string;
  maps: Record<string, LocationMap>;
};

export type MapGroupsJson = {
  group_order: string[];
  [key: string]: string[];
};

export type ParsedMapItem = {
  item: any; // resolved item object
  x: number;
  y: number;
  source: 'item_ball' | 'hidden_item' | 'npc';
  quantity?: number;
};

export type ParsedNpc = {
  graphics: string;
  x: number;
  y: number;
  script: string | null;
  dialog?: string[];
  givesItem?: any;
  trainer?: ParsedTrainer;
};

import type { ParsedPokemon } from '../pokemon/types';

export interface WildPokemonEntry {
  pokemon: ParsedPokemon;
  minLevel: number;
  maxLevel: number;
  rate: number;
}

export interface WildEncounterTable {
  method: string; // land, water, fishing_old_rod, etc
  encounterRate: number; // map-level rate
  encounters: WildPokemonEntry[];
}
