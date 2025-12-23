/* eslint-disable @typescript-eslint/no-explicit-any */
import { getFile } from '../utils';
import type { ParsedAttack, RawIdentifier } from './types';

type Args = {
  files: Map<string, string>;
};

export function parseMoves({ files }: Args): Record<RawIdentifier, ParsedAttack> {
  const battleMovesFile = getFile(files, 'src/data/battle_moves.h');
  if (!battleMovesFile) return {};

  const attacks: Record<string, ParsedAttack> = {};
  const moveBlockRegex = /\[(MOVE_[A-Z0-9_]+)\]\s*=\s*\{([\s\S]*?)\n\s*\},/g;

  let match: RegExpExecArray | null;

  while ((match = moveBlockRegex.exec(battleMovesFile)) !== null) {
    const key = match[1];
    const body = match[2];

    const attack: ParsedAttack = { key };

    // Simple numeric fields
    extractNumber(body, 'power', attack);
    extractNumber(body, 'accuracy', attack);
    extractNumber(body, 'pp', attack);
    extractNumber(body, 'priority', attack);
    extractNumber(body, 'secondaryEffectChance', attack);

    // Raw identifiers
    extractIdentifier(body, 'type', attack);
    extractIdentifier(body, 'effect', attack);
    extractIdentifier(body, 'target', attack);
    extractIdentifier(body, 'split', attack);

    // Flags (bitwise OR list)
    const flagsMatch = body.match(/\.flags\s*=\s*([^,\n]+)/);
    if (flagsMatch) {
      attack.flags = flagsMatch[1]
        .split('|')
        .map((f) => f.trim())
        .filter(Boolean);
    }

    attacks[key] = attack;
  }

  return attacks;
}

/* ---------------- helpers ---------------- */

function extractNumber(body: string, field: keyof ParsedAttack, target: ParsedAttack) {
  const m = body.match(new RegExp(`\\.${field}\\s*=\\s*(-?\\d+)`));
  if (m) (target as any)[field] = Number(m[1]);
}

function extractIdentifier(body: string, field: keyof ParsedAttack, target: ParsedAttack) {
  const m = body.match(new RegExp(`\\.${field}\\s*=\\s*([A-Z0-9_]+)`));
  if (m) (target as any)[field] = m[1];
}
