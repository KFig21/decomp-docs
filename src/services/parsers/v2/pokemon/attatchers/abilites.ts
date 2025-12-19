/* eslint-disable @typescript-eslint/no-explicit-any */
export function attachAbilities(
  pokemon: Record<string, any>,
  baseStatsFile: string,
  abilities: Record<string, any>,
) {
  const blockRegex = /\[\s*(SPECIES_[A-Z0-9_]+)\s*\]\s*=\s*\{([\s\S]*?)\},/g;

  let match;
  while ((match = blockRegex.exec(baseStatsFile))) {
    const [, speciesKey, body] = match;

    const abilitiesMatch = /\.abilities\s*=\s*\{([^\n\r]*)/.exec(body);

    if (!abilitiesMatch) continue;

    const abilityKeys = abilitiesMatch[1]
      .split(',')
      .map((a) => a.trim())
      .filter((a) => a && a !== 'ABILITY_NONE' && abilities[a]);

    if (!pokemon[speciesKey]) continue;

    pokemon[speciesKey].abilities = abilityKeys.map((key) => abilities[key]);
  }
}
