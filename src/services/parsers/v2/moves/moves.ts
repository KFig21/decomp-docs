/* eslint-disable @typescript-eslint/no-explicit-any */
import type { FileContent } from '../../../fileReader';
import { getFile } from '../utils';
import type { ParsedAttack, RawIdentifier } from './types';

type Args = { files: Map<string, FileContent> };

export function parseMoves({ files }: Args): Record<RawIdentifier, ParsedAttack> {
  // The expansion renamed this file to moves_info.h
  const battleMovesFile =
    getFile(files, 'src/data/moves_info.h') || getFile(files, 'src/data/battle_moves.h');

  if (!battleMovesFile) {
    console.warn('[Parser] Could not find moves_info.h or battle_moves.h');
    return {};
  }

  const attacks: Record<string, ParsedAttack> = {};

  const moveBlockRegex = /\[\s*(MOVE_[A-Z0-9_]+)\s*\]\s*=\s*\{([\s\S]*?)\n\s*\}/g;
  let match: RegExpExecArray | null;

  while ((match = moveBlockRegex.exec(battleMovesFile)) !== null) {
    const key = match[1];
    const name = key
      .replace('MOVE_', '')
      .replace(/_/g, ' ')
      .toLowerCase()
      .replace(/\b\w/g, (c) => c.toUpperCase());

    const body = match[2];
    const attack: ParsedAttack = { key, name };

    extractNumber(body, 'power', attack);
    extractNumber(body, 'accuracy', attack);
    extractNumber(body, 'pp', attack);
    extractNumber(body, 'priority', attack);
    extractNumber(body, 'secondaryEffectChance', attack);

    extractIdentifier(body, 'type', attack);
    extractIdentifier(body, 'effect', attack);
    extractIdentifier(body, 'target', attack);
    extractIdentifier(body, 'split', attack);

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

function extractNumber(body: string, field: keyof ParsedAttack, target: ParsedAttack) {
  const m = body.match(new RegExp(`\\.${field}\\s*=\\s*(-?\\d+)`));
  if (m) (target as any)[field] = Number(m[1]);
}

function extractIdentifier(body: string, field: keyof ParsedAttack, target: ParsedAttack) {
  const m = body.match(new RegExp(`\\.${field}\\s*=\\s*([A-Z0-9_]+)`));
  if (m) (target as any)[field] = m[1];
}
