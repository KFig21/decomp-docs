export type WeatherCategory =
  | 'rain'
  | 'sun'
  | 'sand'
  | 'snow'
  | 'hail'
  | 'fog'
  | 'wind'
  | 'field'   // overworld-only visual, no battle effect
  | 'other';

export interface WeatherEffect {
  description: string;
}

export interface ParsedWeather {
  key: string;              // e.g. 'WEATHER_RAIN'
  name: string;             // e.g. 'Rain'
  icon: string;
  category: WeatherCategory;
  battleFlags: string[];    // e.g. ['B_WEATHER_RAIN_NORMAL']
  isFieldOnly: boolean;     // true → cosmetic overworld weather, no battle mechanic
  effects: WeatherEffect[];
}
