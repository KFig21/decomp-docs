/** "NATIONAL_DEX" → "National", "HOENN_DEX" → "Hoenn" */
export function dexTypeLabel(dexType: string): string {
  return dexType
    .replace(/_DEX$/, '')
    .split('_')
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase())
    .join(' ');
}

export const SORT_OPTIONS = [
  { value: 'pokedex', label: 'Pokédex #' },
  { value: 'alpha', label: 'A → Z' },
  { value: 'bst', label: 'BST (High → Low)' },
  { value: 'type', label: 'Primary Type' },
];

export const TYPE_OPTIONS = [
  'Normal',
  'Fire',
  'Water',
  'Electric',
  'Grass',
  'Ice',
  'Fighting',
  'Poison',
  'Ground',
  'Flying',
  'Psychic',
  'Bug',
  'Rock',
  'Ghost',
  'Dragon',
  'Dark',
  'Steel',
  'Fairy',
];

export const ENCOUNTER_OPTIONS = [
  { value: 'Land', label: 'Tall Grass', icon: '🌿' },
  { value: 'Surfing', label: 'Surfing', icon: '🌊' },
  { value: 'Rock Smash', label: 'Rock Smash', icon: '🪨' },
  { value: 'Old Rod', label: 'Old Rod', icon: '🎣' },
  { value: 'Good Rod', label: 'Good Rod', icon: '🎣' },
  { value: 'Super Rod', label: 'Super Rod', icon: '🎣' },
  { value: 'Static', label: 'Static / Gift', icon: '⭐' },
];

export const TYPE_COLORS: Record<string, string> = {
  normal: '#a8a878',
  fire: '#f08030',
  water: '#6890f0',
  electric: '#f8d030',
  grass: '#78c850',
  ice: '#98d8d8',
  fighting: '#c03028',
  poison: '#a040a0',
  ground: '#e0c068',
  flying: '#a890f0',
  psychic: '#f85888',
  bug: '#a8b820',
  rock: '#b8a038',
  ghost: '#705898',
  dragon: '#7038f8',
  dark: '#705848',
  steel: '#b8b8d0',
  fairy: '#ee99ac',
};

export const ENCOUNTER_COLOR = '#3a9bd4';
export const TYPE1_COLOR = '#e67e22';
export const TYPE2_COLOR = '#8e44ad';
