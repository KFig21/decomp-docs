/* eslint-disable @typescript-eslint/no-explicit-any */
import type { ParsedTrainerVariant } from '../trainers/types';
import type { ParsedPokemon } from '../pokemon/types';
import type { ParsedItem } from '../items/types';

export type StaticEncounter = {
  species: ParsedPokemon;
  level: number;
  method: 'Gift' | 'Interaction';
};

export type LocationMap = {
  name: string;
  type: 'outdoor' | 'indoor' | 'special' | 'dungeon' | 'other';
  trainers: ParsedTrainerVariant[];
  items: ParsedMapItem[];
  npcs: ParsedNpc[];
  wildPokemon: WildEncounterTable[];
  staticEncounters: StaticEncounter[];
  mapImage?: string;
};

export type LocationRoot = {
  root: string;
  maps: Record<string, LocationMap>;
  order?: number;
};

export type MapGroupsJson = {
  group_order: string[];
  [key: string]: string[];
};

export type ParsedMapItem = {
  item: ParsedItem;
  x: number;
  y: number;
  // ── extended: berry_tree added ──
  source: 'item_ball' | 'hidden_item' | 'npc' | 'berry_tree';
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
  method: string;
  encounterRate: number;
  encounters: WildPokemonEntry[];
}

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
