/** Threat abilities — passives that can trap, force unfair encounters, etc. */
export const THREAT_ABILITY_OPTIONS = [
  { value: 'ABILITY_ARENA_TRAP', label: 'Arena Trap' },
  { value: 'ABILITY_SHADOW_TAG', label: 'Shadow Tag' },
  { value: 'ABILITY_NO_GUARD', label: 'No Guard' },
];

export const THREAT_ABILITY_COLOR = '#8b6914';

export function isThreatAbility(key: string): boolean {
  return THREAT_ABILITY_OPTIONS.some((o) => o.value === key);
}
