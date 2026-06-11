import type { ParsedTypeChart } from '../../../services/parsers/v2/typeChart/types';

export type { ParsedTypeChart };

// Pseudo-types and battle-internal types that should not appear in matchup UI
const EXCLUDED_TYPES = new Set(['none', 'mystery', 'stellar', 'shadow']);

/** All real attacking types present in the chart (excludes internal pseudo-types). */
export function getAllTypes(chart: ParsedTypeChart): string[] {
  return Object.keys(chart).filter((t) => !EXCLUDED_TYPES.has(t));
}

/** Offensive matchups for a given attacking type. */
export function getOffensive(type: string, chart: ParsedTypeChart) {
  const allTypes = getAllTypes(chart);
  const row = chart[type] ?? {};
  return {
    superEffective:   allTypes.filter((t) => (row[t] ?? 1) === 2),
    notVeryEffective: allTypes.filter((t) => (row[t] ?? 1) === 0.5),
    noEffect:         allTypes.filter((t) => (row[t] ?? 1) === 0),
  };
}

/** Defensive matchups for a given defending type. */
export function getDefensive(type: string, chart: ParsedTypeChart) {
  const weakTo: string[] = [];
  const resistantTo: string[] = [];
  const immuneTo: string[] = [];
  for (const attacker of getAllTypes(chart)) {
    const mult = chart[attacker]?.[type] ?? 1;
    if (mult === 2)        weakTo.push(attacker);
    else if (mult === 0.5) resistantTo.push(attacker);
    else if (mult === 0)   immuneTo.push(attacker);
  }
  return { weakTo, resistantTo, immuneTo };
}
