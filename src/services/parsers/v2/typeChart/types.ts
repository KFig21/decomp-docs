// [attacker][defender] = multiplier  (only non-1× entries stored)
// Keys are lowercase type slugs without the TYPE_ prefix (e.g. "fire", "water")
export type ParsedTypeChart = Record<string, Record<string, number>>;
