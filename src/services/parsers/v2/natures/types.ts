export const STAT_ORDER = ['attack', 'defense', 'speed', 'spAttack', 'spDefense'] as const;

export type NatureStat = (typeof STAT_ORDER)[number];

export type ParsedNature = {
  key: string; // NATURE_ADAMANT
  name: string; // Adamant
  increasedStat: NatureStat | null;
  decreasedStat: NatureStat | null;
};

export type ParsedNatures = Record<string, ParsedNature>;
