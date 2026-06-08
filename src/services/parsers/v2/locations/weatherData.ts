/**
 * Canonical mapping of all weather-related constants to display names.
 *
 * Covers three sources found in pokeemerald-expansion map data:
 *   1. Top-level `weather` field         → WEATHER_* constants
 *   2. coord_events with type "weather"  → COORD_EVENT_WEATHER_* constants
 *   3. setweather commands in scripts.inc → WEATHER_* constants
 *
 * Constants that map to `null` are cosmetic/default and are silently skipped.
 */
export const WEATHER_DISPLAY: Record<string, string | null> = {
  // ── WEATHER_* (top-level field + setweather in scripts) ────────────────────
  WEATHER_NONE: null,
  WEATHER_SUNNY_CLOUDS: null,   // default outdoor sky — not interesting
  WEATHER_SUNNY: null,          // clear default — not a notable condition
  WEATHER_RAIN: 'Rain',
  WEATHER_SNOW: 'Snow',
  WEATHER_RAIN_THUNDERSTORM: 'Thunderstorm',
  WEATHER_FOG_HORIZONTAL: 'Fog',
  WEATHER_VOLCANIC_ASH: 'Volcanic Ash',
  WEATHER_SANDSTORM: 'Sandstorm',
  WEATHER_FOG_DIAGONAL: 'Dense Fog',
  WEATHER_UNDERWATER: 'Underwater',
  WEATHER_SHADE: 'Overcast',
  WEATHER_DROUGHT: 'Drought',
  WEATHER_DOWNPOUR: 'Downpour',
  WEATHER_UNDERWATER_BUBBLES: 'Underwater',
  WEATHER_ABNORMAL: 'Abnormal',
  WEATHER_ROUTE119_CYCLE: 'Varying Weather',
  WEATHER_ROUTE123_CYCLE: 'Varying Weather',
  WEATHER_FOG: 'Fog',

  // ── COORD_EVENT_WEATHER_* (coord_events with type "weather") ───────────────
  COORD_EVENT_WEATHER_SUNNY_CLOUDS: null,
  COORD_EVENT_WEATHER_SUNNY: null,
  COORD_EVENT_WEATHER_RAIN: 'Rain',
  COORD_EVENT_WEATHER_SNOW: 'Snow',
  COORD_EVENT_WEATHER_RAIN_THUNDERSTORM: 'Thunderstorm',
  COORD_EVENT_WEATHER_FOG_HORIZONTAL: 'Fog',
  COORD_EVENT_WEATHER_FOG_DIAGONAL: 'Dense Fog',
  COORD_EVENT_WEATHER_VOLCANIC_ASH: 'Volcanic Ash',
  COORD_EVENT_WEATHER_SANDSTORM: 'Sandstorm',
  COORD_EVENT_WEATHER_SHADE: 'Overcast',
  COORD_EVENT_WEATHER_DROUGHT: 'Drought',
  COORD_EVENT_WEATHER_ROUTE119_CYCLE: 'Varying Weather',
  COORD_EVENT_WEATHER_ROUTE123_CYCLE: 'Varying Weather',
};

/** Resolve a raw weather constant to a display name, or null to skip it. */
export function resolveWeatherName(raw: string | undefined | null): string | null {
  if (!raw) return null;
  if (raw in WEATHER_DISPLAY) return WEATHER_DISPLAY[raw];
  // Unknown constant — title-case it as a best-effort fallback
  return raw
    .replace(/^(MAP_WEATHER_|WEATHER_|COORD_EVENT_WEATHER_)/, '')
    .replace(/_/g, ' ')
    .replace(/\b\w/g, (c) => c.toUpperCase());
}

/** Weather icons for UI display, keyed by display name. */
export const WEATHER_ICONS: Record<string, string> = {
  Rain: '🌧️',
  Thunderstorm: '⛈️',
  Sandstorm: '🌪️',
  Snow: '❄️',
  Fog: '🌫️',
  'Dense Fog': '🌁',
  'Volcanic Ash': '🌋',
  Overcast: '☁️',
  Drought: '☀️',
  Downpour: '🌊',
  Underwater: '💧',
  Abnormal: '✨',
  'Varying Weather': '🔄',
};
