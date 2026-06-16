import type { FileContent } from '../../../fileReader';
import type { ParsedWeather, WeatherCategory, WeatherEffect } from './types';
import { getFile } from '../utils';

// ── Battle-flag → effect descriptions ────────────────────────────────────────
// These describe what each B_WEATHER_* flag MEANS mechanically in battle.
// This is game-engine knowledge (what the battle system does with each flag),
// not hack-specific or route-specific. Keyed on the flag name prefix so any
// custom B_WEATHER_RAIN_* variant in a hack still resolves correctly.

const FLAG_EFFECTS: Array<{ match: (flag: string) => boolean; effects: WeatherEffect[] }> = [
  {
    match: (f) => f.startsWith('B_WEATHER_RAIN'),
    effects: [
      { description: 'Water-type moves deal 50% more damage' },
      { description: 'Fire-type moves deal 50% less damage' },
      { description: 'Thunder and Hurricane always hit' },
      { description: 'Solar Beam / Solar Blade require a charge turn and lose power' },
      { description: 'Synthesis, Morning Sun, and Moonlight restore only ¼ HP' },
      { description: 'Swift Swim doubles Speed; Rain Dish and Dry Skin restore HP each turn' },
    ],
  },
  {
    match: (f) => f.startsWith('B_WEATHER_SUN'),
    effects: [
      { description: 'Fire-type moves deal 50% more damage' },
      { description: 'Water-type moves deal 50% less damage' },
      { description: 'Solar Beam and Solar Blade require no charge turn' },
      { description: 'Thunder and Hurricane have 50% accuracy' },
      { description: 'Synthesis, Morning Sun, and Moonlight restore ⅔ HP' },
      { description: 'Chlorophyll doubles Speed; Leaf Guard prevents status conditions' },
    ],
  },
  {
    match: (f) => f.startsWith('B_WEATHER_SANDSTORM') || f === 'B_WEATHER_SAND',
    effects: [
      { description: 'Non-Rock/Ground/Steel types lose 1/16 max HP each turn' },
      { description: 'Rock-type Pokémon gain +50% Special Defense' },
      { description: 'Sand Rush and Sand Force abilities activate' },
      { description: 'Solar Beam / Solar Blade lose power; Synthesis restores only ¼ HP' },
    ],
  },
  {
    match: (f) => f.startsWith('B_WEATHER_HAIL'),
    effects: [
      { description: 'Non-Ice types lose 1/16 max HP each turn' },
      { description: 'Blizzard never misses; Ice Body restores HP each turn' },
      { description: 'Slush Rush doubles Speed' },
    ],
  },
  {
    match: (f) => f.startsWith('B_WEATHER_SNOW'),
    effects: [
      { description: 'Ice-type Pokémon gain +50% Defense' },
      { description: 'Blizzard never misses; Ice Body restores HP each turn' },
      { description: 'Slush Rush doubles Speed' },
    ],
  },
  {
    match: (f) => f.startsWith('B_WEATHER_FOG'),
    effects: [
      { description: 'All moves have their accuracy multiplied by 0.6' },
      { description: 'Synthesis, Morning Sun, and Moonlight restore only ¼ HP' },
    ],
  },
  {
    match: (f) => f.startsWith('B_WEATHER_STRONG_WIND') || f.startsWith('B_WEATHER_DELTA'),
    effects: [
      { description: 'Flying-type Pokémon are immune to moves super effective against them' },
      { description: 'Delta Stream — cannot be replaced or suppressed by other weather' },
    ],
  },
];

// ── Parse battle.h for B_WEATHER_* flag names ─────────────────────────────────

function parseBattleWeatherFlags(files: Map<string, FileContent>): string[] {
  const raw = getFile(files, 'include/constants/battle.h');
  if (!raw) return [];
  const flags: string[] = [];
  const regex = /^#define\s+(B_WEATHER_[A-Z0-9_]+)\s+/gm;
  let m: RegExpExecArray | null;
  while ((m = regex.exec(raw))) {
    if (!flags.includes(m[1])) flags.push(m[1]);
  }
  return flags;
}

// ── Parse weather.c/weather.h for WEATHER_* → B_WEATHER_* assignments ─────────
// Looks for patterns like:
//   case WEATHER_RAIN: gBattleWeather = B_WEATHER_RAIN_NORMAL; break;
//   [WEATHER_FOO] = B_WEATHER_BAR,                               (table form)
//   gBattleWeather |= B_WEATHER_FOG;                             (OR-assignment)

function parseWeatherFlagAssignments(
  files: Map<string, FileContent>,
  knownFlags: Set<string>,
): Record<string, string[]> {
  const mapping: Record<string, string[]> = {};

  const candidates = [
    getFile(files, 'src/weather.c'),
    getFile(files, 'src/field_weather.c'),
    getFile(files, 'src/battle_weather.c'),
  ].filter(Boolean).join('\n');

  if (!candidates) return mapping;

  // Pattern 1: case WEATHER_FOO: ... gBattleWeather [=||=] <expr> ...
  // We grab everything between the case label and the next break/return.
  const caseBlock = /case\s+(WEATHER_[A-Z0-9_]+)\s*:([\s\S]*?)(?=\bcase\b|\bdefault\b|\breturn\b|^})/gm;
  let m: RegExpExecArray | null;
  while ((m = caseBlock.exec(candidates))) {
    const weatherKey = m[1];
    const body = m[2];
    const flagsInBody = (body.match(/B_WEATHER_[A-Z0-9_]+/g) ?? []).filter((f) =>
      knownFlags.has(f),
    );
    if (flagsInBody.length) {
      mapping[weatherKey] = [...new Set([...(mapping[weatherKey] ?? []), ...flagsInBody])];
    }
  }

  // Pattern 2: array/table initialiser form — [WEATHER_FOO] = B_WEATHER_BAR
  const tableRow = /\[WEATHER_([A-Z0-9_]+)\]\s*=\s*(B_WEATHER_[A-Z0-9_]+)/g;
  while ((m = tableRow.exec(candidates))) {
    const weatherKey = `WEATHER_${m[1]}`;
    const flag = m[2];
    if (knownFlags.has(flag)) {
      mapping[weatherKey] = [...new Set([...(mapping[weatherKey] ?? []), flag])];
    }
  }

  return mapping;
}

// ── Inference helpers (name-based, no hardcoded constants) ────────────────────

function stripPrefix(key: string): string {
  return key.replace(/^(COORD_EVENT_WEATHER_|WEATHER_)/, '');
}

function toDisplayName(fragment: string): string {
  return fragment
    .toLowerCase()
    .replace(/_/g, ' ')
    .replace(/\b\w/g, (c) => c.toUpperCase());
}

function inferCategory(key: string): WeatherCategory {
  const k = key.toUpperCase();
  if (k.includes('RAIN') || k.includes('THUNDER') || k.includes('DOWNPOUR') || k.includes('STORM')) return 'rain';
  if (k.includes('DROUGHT') || k.includes('HARSH_SUN') || k.includes('PRIMAL_SUN')) return 'sun';
  if (k.includes('SUN') && !k.includes('SUNNY')) return 'sun';
  if (k.includes('SAND')) return 'sand';
  if (k.includes('HAIL')) return 'hail';
  if (k.includes('SNOW') || k.includes('BLIZZARD')) return 'snow';
  if (k.includes('FOG')) return 'fog';
  if (k.includes('WIND') || k.includes('DELTA_STREAM') || k.includes('STRONG_WIND')) return 'wind';
  return 'field';
}

function inferIcon(category: WeatherCategory, key: string): string {
  const k = key.toUpperCase();
  if (k.includes('VOLCANIC') || k.includes('ASH')) return '🌋';
  if (k.includes('UNDERWATER') || k.includes('BUBBLES')) return '💧';
  switch (category) {
    case 'rain': return k.includes('THUNDER') || k.includes('STORM') ? '⛈️' : '🌧️';
    case 'sun': return k.includes('DROUGHT') || k.includes('HARSH') ? '🔆' : '☀️';
    case 'sand': return '🌪️';
    case 'snow': return '❄️';
    case 'hail': return '🌨️';
    case 'fog': return k.includes('DENSE') || k.includes('DIAGONAL') ? '🌁' : '🌫️';
    case 'wind': return '💨';
    default:
      if (k.includes('SHADE') || k.includes('CLOUD')) return '⛅';
      if (k.includes('SUNNY') || k.includes('CLEAR')) return '☀️';
      return '🌤️';
  }
}

/**
 * True for cosmetic overworld weather that has no battle effect and should not
 * appear in filter bars or location badges.
 * Also covers cycle constants (ROUTE119_CYCLE etc.) — these are map-scripting
 * artefacts whose actual constituent weathers vary per hack and cannot be
 * statically determined.
 */
function inferIsFieldOnly(key: string): boolean {
  const fragment = stripPrefix(key.toUpperCase());
  return (
    fragment === 'NONE' ||
    fragment === 'SUNNY' ||
    fragment === 'SUNNY_CLOUDS' ||
    fragment === 'SHADE' ||
    fragment.startsWith('UNDERWATER') ||
    fragment === 'PARTLY_CLOUDY' ||
    fragment.includes('CYCLE')
  );
}

/** Look up effects for a set of battle flags, using the FLAG_EFFECTS table. */
function effectsForFlags(flags: string[]): WeatherEffect[] {
  for (const entry of FLAG_EFFECTS) {
    if (flags.some(entry.match)) return entry.effects;
  }
  return [];
}

/**
 * Fallback: infer which flags SHOULD apply to this weather based on category,
 * chosen from the flags that actually exist in the project's battle.h.
 */
function inferFlagsFromCategory(category: WeatherCategory, availableFlags: string[]): string[] {
  const prefixMap: Partial<Record<WeatherCategory, string>> = {
    rain: 'B_WEATHER_RAIN',
    sun: 'B_WEATHER_SUN',
    sand: 'B_WEATHER_SANDSTORM',
    hail: 'B_WEATHER_HAIL',
    snow: 'B_WEATHER_SNOW',
    fog: 'B_WEATHER_FOG',
    wind: 'B_WEATHER_STRONG_WIND',
  };
  const prefix = prefixMap[category];
  if (!prefix) return [];
  return availableFlags.filter((f) => f.startsWith(prefix));
}

// ── Main parser ───────────────────────────────────────────────────────────────

/**
 * Build a ParsedWeather record from the project's source files.
 *
 * Sources used:
 *   include/constants/weather.h  — which weather constants exist
 *   include/constants/battle.h   — which B_WEATHER_* flags exist
 *   src/weather.c / field_weather.c / battle_weather.c
 *                                — which weather sets which battle flags
 *
 * Everything is inferred dynamically; no route-specific definitions are
 * hardcoded here. Works for any ROM hack.
 */
export function parseWeathers(files: Map<string, FileContent>): Record<string, ParsedWeather> {
  const result: Record<string, ParsedWeather> = {};

  const weatherRaw = getFile(files, 'include/constants/weather.h');
  if (!weatherRaw) return result;

  // 1. Collect available B_WEATHER_* flags from battle.h
  const availableFlags = parseBattleWeatherFlags(files);
  const flagSet = new Set(availableFlags);

  // 2. Try to parse the weather → battle-flag assignments from C source
  const parsedAssignments = parseWeatherFlagAssignments(files, flagSet);

  // 3. Parse each weather constant
  const defineRegex = /^#define\s+((?:COORD_EVENT_WEATHER|WEATHER)_[A-Z0-9_]+)\s+\d+/gm;
  let m: RegExpExecArray | null;

  while ((m = defineRegex.exec(weatherRaw))) {
    const key = m[1];
    if (key in result) continue;

    const fragment = stripPrefix(key);
    const category = inferCategory(key);
    const isFieldOnly = inferIsFieldOnly(key);

    // Determine battle flags:
    //   - Prefer parsed assignments from weather.c (most accurate)
    //   - Fall back to category-based inference from available flags
    const battleFlags = isFieldOnly
      ? []
      : (parsedAssignments[key] ??
         parsedAssignments[key.replace(/^COORD_EVENT_WEATHER_/, 'WEATHER_')] ??
         inferFlagsFromCategory(category, availableFlags));

    result[key] = {
      key,
      name: toDisplayName(fragment),
      icon: inferIcon(category, key),
      category,
      battleFlags,
      isFieldOnly,
      effects: isFieldOnly ? [] : effectsForFlags(battleFlags),
    };
  }

  return result;
}

// ── Lookup helper used by the location parser ─────────────────────────────────

/**
 * Look up a ParsedWeather by its raw constant string.
 * Returns null for field-only / cosmetic weather.
 */
export function resolveWeather(
  raw: string | null | undefined,
  weathers: Record<string, ParsedWeather>,
): ParsedWeather | null {
  if (!raw) return null;
  const w = weathers[raw];
  if (!w) return null;
  if (w.isFieldOnly) return null;
  return w;
}
