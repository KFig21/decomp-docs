/* eslint-disable @typescript-eslint/no-explicit-any */
import type { ParsedTrainerVariant } from '../trainers/types';
import type { ParsedPokemon } from '../pokemon/types';
import type { ParsedItem } from '../items/types';

export type LocationMap = {
  name: string;
  type: 'outdoor' | 'indoor' | 'special' | 'dungeon' | 'other';

  trainers: ParsedTrainerVariant[];
  items: ParsedMapItem[];
  npcs: ParsedNpc[];
  wildPokemon: WildEncounterTable[];
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
  item: ParsedItem;
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
  trainer?: ParsedTrainerVariant;
};

// --- Wild encounters types ---

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

// --- Wild encounters data parsed from JSON ('src/data/wild_encounters.json') ---

export type WildEncounterPokemon_fromJson = {
  species: string;
  min_level: number;
  max_level: number;
};

export type WildEncounterMethod_fromJson = {
  encounter_rate: number;
  mons: WildEncounterPokemon_fromJson[];
};

export type WildEncounterLocation_fromJson = {
  map: string;
  base_label?: string;
} & Record<string, WildEncounterMethod_fromJson | string | undefined>;

export type WildEncounters_fromJson = {
  wild_encounter_groups: {
    label: string;
    for_maps: boolean;
    fields: {
      type: string;
      encounter_rates: number[];
      groups?: Record<string, number[]>;
    }[];
    encounters: WildEncounterLocation_fromJson[];
  }[];
};
