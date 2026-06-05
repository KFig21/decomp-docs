// CHANGES FROM ORIGINAL:
//   • METHOD_DISPLAY_NAMES map added – cleans up raw JSON keys like
//     "rock_smash_mons" → "Rock Smash" for display in the UI
//   • normalizeMethodKey() exported so WildLocations component can use it
//   • Everything else unchanged
//
import type { ParsedPokemon } from '../pokemon/types';
import type {
  WildPokemonEntry,
  WildEncounters_fromJson,
  WildEncounterTable,
  WildEncounterMethod_fromJson,
} from './types';

// Maps raw JSON method keys to human-readable display labels.
// Grouped fishing methods come in as e.g. "fishing_old_rod_group_old_rod" –
// the prefix match in normalizeMethodKey handles those.
export const METHOD_DISPLAY_NAMES: Record<string, string> = {
  land_mons: 'Tall Grass',
  water_mons: 'Surfing',
  rock_smash_mons: 'Rock Smash',
  fishing_old_rod: 'Old Rod',
  fishing_good_rod: 'Good Rod',
  fishing_super_rod: 'Super Rod',
  static: 'Static / Gift',
};

/** Returns a clean display label for any encounter method string. */
export function normalizeMethodKey(raw: string): string {
  // Direct hit
  if (METHOD_DISPLAY_NAMES[raw]) return METHOD_DISPLAY_NAMES[raw];
  // Grouped fishing: e.g. "fishing_old_rod_old_rod" → "Old Rod"
  for (const [key, label] of Object.entries(METHOD_DISPLAY_NAMES)) {
    if (raw.startsWith(key)) return label;
  }
  // Last resort: title-case the raw key
  return raw
    .replace(/_mons$/, '')
    .replace(/_/g, ' ')
    .replace(/\b\w/g, (c) => c.toUpperCase());
}

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

      if (field.groups) {
        // Grouped methods (e.g. fishing rods split by group)
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
        // Standard methods: land, water, rock_smash_mons, etc.
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
