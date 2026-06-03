// decomp-docs/src/components/elements/sprites/trainerSpriteUtils.ts

export function normalizeTrainerSpriteName(
  name?: string,
  trainerClass?: string,
  trainerPic?: string,
): string {
  const lowerName = (name || '').toLowerCase().trim();
  const lowerClass = (trainerClass || '').toLowerCase().trim();
  const lowerPic = (trainerPic || '').toLowerCase().trim();

  // 1. Handle Important Characters (Named NPCs)
  const importantClasses = [
    'leader',
    'gym leader',
    'elite four',
    'champion',
    'rival',
    'boss',
    'admin',
    'magma admin',
    'aqua admin',
  ];

  const isImportant = importantClasses.some((c) => lowerClass.includes(c) || lowerPic.includes(c));

  if (isImportant && lowerName) {
    const cleanName = lowerName.replace(/&/g, 'and').replace(/[\s\-_']/g, '');
    if (cleanName === 'tateliza') return 'tateandliza';
    return cleanName;
  }

  // 2. Generic Classes
  // Prioritize 'lowerPic' because the Decomp stores gender markers here (e.g., "Cooltrainer F")
  let raw = lowerPic || lowerClass || 'unknown';

  // 3. Pre-process specific Decomp terminology
  raw = raw.replace('pkmn', 'pokemon');

  // 4. Flatten the string
  const clean = raw.replace(/[\s\-_']/g, '');

  // 5. Explicit Decomp -> Showdown Mappings
  // Showdown usually makes the male sprite the "base" string (no 'm' suffix),
  // so we must explicitly map the Decomp's 'm' variants back to the base string.
  const generics: Record<string, string> = {
    // Ace Trainers
    cooltrainer: 'acetrainer',
    cooltrainerm: 'acetrainer',
    cooltrainerf: 'acetrainerf',

    // Experts (Showdown explicitly uses 'm' for expert)
    expert: 'expert',
    expertm: 'expert',
    expertf: 'expertf',

    // Tubers (Showdown explicitly uses 'm' for tuber)
    tuber: 'tuber',
    tuberm: 'tuber',
    tuberf: 'tuberf',

    // Breeders
    pokemonbreeder: 'pokemonbreeder',
    pokemonbreederm: 'pokemonbreeder',
    pokemonbreederf: 'pokemonbreederf',

    // Pokefans
    pokefan: 'pokefan',
    pokefanm: 'pokefan',
    pokefanf: 'pokefanf',

    // Pokemon Rangers
    pokemonranger: 'pokemonranger',
    pokemonrangerm: 'pokemonranger',
    pokemonrangerf: 'pokemonrangerf',

    // Psychics
    psychic: 'psychic',
    psychicm: 'psychic',
    psychicf: 'psychicf',

    // Evil Teams
    magmagrunt: 'magmagrunt',
    magmagruntm: 'magmagrunt',
    magmagruntf: 'magmagruntf',
    aquagrunt: 'aquagrunt',
    aquagruntm: 'aquagrunt',
    aquagruntf: 'aquagruntf',

    // Twins
    twin: 'twins',

    // Twins
    interviewer: 'interviewers',
  };

  if (generics[clean]) return generics[clean];

  // 6. Triathletes (Decomp splits them by event, Showdown concatenates them)
  if (clean.includes('triathlete')) {
    const isFemale = clean.endsWith('f');
    if (clean.includes('swim')) return isFemale ? 'triathleteswimmerf' : 'triathleteswimmerm';
    if (clean.includes('cycling') || clean.includes('bike'))
      return isFemale ? 'triathletebikerf' : 'triathletebikerm';
    if (clean.includes('run')) return isFemale ? 'triathleterunnerf' : 'triathleterunnerm';
  }

  // 7. Final fallback
  return clean.replace(/[^a-z0-9]/g, '');
}
