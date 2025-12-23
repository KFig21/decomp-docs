import type { ParsedPokemon } from '../pokemon/types';
import type {
  WildPokemonEntry,
  WildEncounters_fromJson,
  WildEncounterTable,
  WildEncounterMethod_fromJson,
} from './types';

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
  json: WildEncounters_fromJson,
  pokemonBySpecies: Record<string, ParsedPokemon>,
): Record<string, WildEncounterTable[]> {
  const result: Record<string, WildEncounterTable[]> = {};
  const group = json.wild_encounter_groups.find((g) => g.for_maps);
  if (!group) return result;

  const fieldDefs = Object.fromEntries(group.fields.map((f) => [f.type, f]));

  for (const location of group.encounters) {
    const mapId = location.map;
    const tables: WildEncounterTable[] = [];

    for (const [method, data] of Object.entries(location)) {
      if (method === 'map' || method === 'base_label') continue;
      if (!data || typeof data !== 'object') continue;

      const encounterMethodData = data as WildEncounterMethod_fromJson;
      const field = fieldDefs[method];
      if (!field) continue;

      const rates = field.encounter_rates;
      const encounterablePokemon = encounterMethodData.mons;

      // 🎣 Grouped methods (Old Rod / Good Rod / Super Rod)
      if (field.groups) {
        for (const [groupName, indexes] of Object.entries(field.groups)) {
          const rawEncounters: WildPokemonEntry[] = [];

          indexes.forEach((i) => {
            const monInContext = encounterablePokemon[i];
            if (!monInContext) return;

            const species = pokemonBySpecies[monInContext.species];
            if (!species) return;

            rawEncounters.push({
              pokemon: species,
              minLevel: monInContext.min_level,
              maxLevel: monInContext.max_level,
              rate: rates[i],
            });
          });

          tables.push({
            method: `${method}_${groupName}`,
            encounterRate: encounterMethodData.encounter_rate,
            encounters: mergeAndSortEncounters(rawEncounters),
          });
        }
      } else {
        // 🌿 Standard methods (land, water, rock smash, etc)
        const rawEncounters: WildPokemonEntry[] = [];

        encounterablePokemon.forEach((monInContext, i) => {
          const species = pokemonBySpecies[monInContext.species];
          if (!species) return;

          rawEncounters.push({
            pokemon: species,
            minLevel: monInContext.min_level,
            maxLevel: monInContext.max_level,
            rate: rates[i],
          });
        });

        tables.push({
          method,
          encounterRate: encounterMethodData.encounter_rate,
          encounters: mergeAndSortEncounters(rawEncounters),
        });
      }
    }

    result[mapId] = tables;
  }

  return result;
}
