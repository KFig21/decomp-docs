export function normalizeTrainerSpriteName(raw?: string) {
  if (!raw) return 'unknown';

  const clean = raw.toLowerCase().trim();

  const isMale = clean.includes(' m') || clean.endsWith('m');
  const isFemale = clean.includes(' f') || clean.endsWith('f');

  // ----- COOLTTRAINER → ACE TRAINER -----
  if (clean.includes('cooltrainer')) {
    return 'acetrainer';
  }

  // ----- TRIATHLETE -----
  if (clean.includes('triathlete')) {
    if (clean.includes('swim')) return isMale ? 'triathleteswimmerm' : 'triathleteswimmerf';
    if (clean.includes('bike')) return isMale ? 'triathletebikerm' : 'triathletebikerf';
    if (clean.includes('run')) return isMale ? 'triathleterunnerm' : 'triathleterunnerf';
  }

  // ----- POKEFAN -----
  if (clean.startsWith('pokefan')) {
    return isFemale ? 'pokefanf' : 'pokefan';
  }

  // ----- TUBER -----
  if (clean.includes('tuber')) {
    return isFemale ? 'tuberf' : 'tuberm';
  }

  // ----- PSYCHIC -----
  if (clean.includes('psychic')) {
    return isFemale ? 'psychicf' : 'psychicm';
  }

  // ----- EXPERT -----
  if (clean.includes('expert')) {
    return isFemale ? 'expertf' : 'expertm';
  }

  // ----- SCHOOL KID -----
  if (clean.includes('school kid') || clean.includes('schoolkid')) {
    return isFemale ? 'schoolkidf' : 'schoolkidm';
  }

  // ----- POKÉMON BREEDER -----
  if (clean.includes('breeder')) {
    return isFemale ? 'pokemonbreederf' : 'pokemonbreederm';
  }

  // ----- POKÉMON RANGER -----
  if (clean.includes('ranger')) {
    return isFemale ? 'pokemonrangerf' : 'pokemonrangerm';
  }

  // ----- GENERIC FALLBACK -----
  return clean.replace(/[^a-z0-9]/g, '');
}
