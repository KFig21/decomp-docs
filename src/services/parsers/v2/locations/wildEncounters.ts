import type { WildEncounterTable, WildPokemonEntry } from './types';
import type { ParsedPokemon } from '../pokemon/types';

type WildEncounterMon = {
  min_level: number;
  max_level: number;
  species: string;
};

type WildEncounterMethodData = {
  encounter_rate: number;
  mons: WildEncounterMon[];
};

type WildEncounterEntry = {
  map: string;
  base_label?: string;
} & Record<string, WildEncounterMethodData | string | undefined>;

type WildEncountersJson = {
  wild_encounter_groups: {
    label: string;
    for_maps: boolean;
    fields: {
      type: string;
      encounter_rates: number[];
      groups?: Record<string, number[]>;
    }[];
    encounters: WildEncounterEntry[];
  }[];
};

function mergeAndSortEncounters(encounters: WildPokemonEntry[]): WildPokemonEntry[] {
  const merged = new Map<string, WildPokemonEntry>();

  for (const e of encounters) {
    const key = `${e.pokemon.key}|${e.minLevel}|${e.maxLevel}`;

    const existing = merged.get(key);
    if (existing) {
      existing.rate += e.rate;
    } else {
      merged.set(key, { ...e });
    }
  }

  return Array.from(merged.values()).sort((a, b) => b.rate - a.rate);
}

export function parseWildEncounters(
  json: WildEncountersJson,
  pokemonBySpecies: Record<string, ParsedPokemon>,
): Record<string, WildEncounterTable[]> {
  const result: Record<string, WildEncounterTable[]> = {};

  const group = json.wild_encounter_groups.find((g) => g.for_maps);
  if (!group) return result;

  const fieldDefs = Object.fromEntries(group.fields.map((f) => [f.type, f]));

  for (const encounter of group.encounters) {
    const mapId = encounter.map;
    const tables: WildEncounterTable[] = [];

    for (const [method, data] of Object.entries(encounter)) {
      if (method === 'map' || method === 'base_label') continue;
      if (!data || typeof data !== 'object') continue;

      const methodData = data as WildEncounterMethodData;
      const field = fieldDefs[method];
      if (!field) continue;

      const rates = field.encounter_rates;
      const mons = methodData.mons;

      // 🎣 Grouped methods (Old Rod / Good Rod / Super Rod)
      if (field.groups) {
        for (const [groupName, indexes] of Object.entries(field.groups)) {
          const rawEncounters: WildPokemonEntry[] = [];

          indexes.forEach((i) => {
            const mon = mons[i];
            if (!mon) return;

            const pokemon = pokemonBySpecies[mon.species];
            if (!pokemon) return;

            rawEncounters.push({
              pokemon,
              minLevel: mon.min_level,
              maxLevel: mon.max_level,
              rate: rates[i],
            });
          });

          tables.push({
            method: `${method}_${groupName}`,
            encounterRate: methodData.encounter_rate,
            encounters: mergeAndSortEncounters(rawEncounters),
          });
        }
      } else {
        // 🌿 Standard methods (land, water, rock smash, etc)
        const rawEncounters: WildPokemonEntry[] = [];

        mons.forEach((mon, i) => {
          const pokemon = pokemonBySpecies[mon.species];
          if (!pokemon) return;

          rawEncounters.push({
            pokemon,
            minLevel: mon.min_level,
            maxLevel: mon.max_level,
            rate: rates[i],
          });
        });

        tables.push({
          method,
          encounterRate: methodData.encounter_rate,
          encounters: mergeAndSortEncounters(rawEncounters),
        });
      }
    }

    result[mapId] = tables;
  }

  return result;
}
