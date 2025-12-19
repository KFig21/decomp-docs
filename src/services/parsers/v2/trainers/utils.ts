// v2/trainers/utils.ts
export function normalizeTrainerConstant(constant: string) {
  if (!constant) return 'Unknown';

  return constant
    .replace(/^TRAINER_CLASS_|^TRAINER_PIC_/, '')
    .toLowerCase()
    .split('_')
    .map((w) => w[0].toUpperCase() + w.slice(1))
    .join(' ');
}

// Gets default moves from learnset files
export function getDefaultMoves(
  speciesId: string,
  level: number,
  ptrFile: string,
  learnsetsFile: string,
): string[] {
  const ptrMatch = ptrFile.match(new RegExp(`\\[${speciesId}\\]\\s*=\\s*(s[A-Za-z0-9_]+)`));
  if (!ptrMatch) return [];

  const learnsetMatch = learnsetsFile.match(
    new RegExp(`static const struct LevelUpMove ${ptrMatch[1]}\\[\\][\\s\\S]*?LEVEL_UP_END`),
  );
  if (!learnsetMatch) return [];

  return Array.from(learnsetMatch[0].matchAll(/LEVEL_UP_MOVE\(\s*(\d+),\s*(MOVE_[A-Z0-9_]+)\s*\)/g))
    .filter((m) => Number(m[1]) <= level)
    .slice(-4)
    .map((m) => m[2]);
}
