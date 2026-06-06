/* eslint-disable @typescript-eslint/no-explicit-any */
import type { FileContent } from '../../../fileReader';
import { getFile } from '../utils';
import type { ParsedAttack, RawIdentifier } from './types';

type Args = { files: Map<string, FileContent> };

// ── All boolean flag field names present in moves_info.h ─────────────────────
// These are parsed as TRUE/FALSE fields at the struct level.
// We extract them all and store as a Set<string> on the move.
const BOOLEAN_FLAGS = [
  'makesContact',
  'ignoresProtect',
  'magicCoatAffected',
  'snatchAffected',
  'ignoresKingsRock',
  'soundMove',
  'punchingMove',
  'bitingMove',
  'pulseMove',
  'ballisticMove',
  'windMove',
  'powderMove',
  'danceMove',
  'slicingMove',
  'ignoresSubstitute',
  'forcePressure',
  'cantUseTwice',
  'mirrorMoveBanned',
  'metronomeBanned',
  'copycatBanned',
  'sleepTalkBanned',
  'instructBanned',
  'assistBanned',
  'parentalBondBanned',
  'skyBattleBanned',
  'multiHit',
  'twoTurnMove',
  'higherCritRatio',
  'alwaysCriticalHit',
  'strikesTwice',
  'minimizeDoubleDamage',
  'healingMove',
  'ignoresTargetAbility',
  'ignoresTargetDefenseEvasionChanges',
  'targetsUserPartner',
  'targetsOppositeCorner',
];

// ── Additional effect → human label map ──────────────────────────────────────
// Covers the MOVE_EFFECT_* values seen in .additionalEffects.
// Used to build move.sideEffects[] for display.
const MOVE_EFFECT_LABELS: Record<string, string> = {
  MOVE_EFFECT_BURN: 'May burn',
  MOVE_EFFECT_FREEZE: 'May freeze',
  MOVE_EFFECT_PARALYSIS: 'May paralyze',
  MOVE_EFFECT_POISON: 'May poison',
  MOVE_EFFECT_TOXIC: 'May badly poison',
  MOVE_EFFECT_CONFUSION: 'May confuse',
  MOVE_EFFECT_FLINCH: 'May flinch',
  MOVE_EFFECT_SLEEP: 'Puts to sleep',
  MOVE_EFFECT_ATK_PLUS_1: '+1 Atk (self)',
  MOVE_EFFECT_DEF_PLUS_1: '+1 Def (self)',
  MOVE_EFFECT_SPD_PLUS_1: '+1 Spd (self)',
  MOVE_EFFECT_SP_ATK_PLUS_1: '+1 Sp.Atk (self)',
  MOVE_EFFECT_SP_DEF_PLUS_1: '+1 Sp.Def (self)',
  MOVE_EFFECT_ACC_PLUS_1: '+1 Acc (self)',
  MOVE_EFFECT_EVS_PLUS_1: '+1 Eva (self)',
  MOVE_EFFECT_ATK_MINUS_1: '-1 Atk (foe)',
  MOVE_EFFECT_DEF_MINUS_1: '-1 Def (foe)',
  MOVE_EFFECT_SPD_MINUS_1: '-1 Spd (foe)',
  MOVE_EFFECT_SP_ATK_MINUS_1: '-1 Sp.Atk (foe)',
  MOVE_EFFECT_SP_DEF_MINUS_1: '-1 Sp.Def (foe)',
  MOVE_EFFECT_ACC_MINUS_1: '-1 Acc (foe)',
  MOVE_EFFECT_EVS_MINUS_1: '-1 Eva (foe)',
  MOVE_EFFECT_ATK_PLUS_2: '+2 Atk (self)',
  MOVE_EFFECT_DEF_PLUS_2: '+2 Def (self)',
  MOVE_EFFECT_SPD_PLUS_2: '+2 Spd (self)',
  MOVE_EFFECT_SP_ATK_PLUS_2: '+2 Sp.Atk (self)',
  MOVE_EFFECT_SP_DEF_PLUS_2: '+2 Sp.Def (self)',
  MOVE_EFFECT_ALL_STATS_UP: '+1 All stats (self)',
  MOVE_EFFECT_REMOVE_STATUS: 'Cures status',
  MOVE_EFFECT_RECOIL_25: 'User takes recoil',
  MOVE_EFFECT_RECOIL_33: 'User takes recoil',
  MOVE_EFFECT_RECOIL_50: 'User takes recoil',
};

export function parseMoves({ files }: Args): Record<RawIdentifier, ParsedAttack> {
  const battleMovesFile =
    getFile(files, 'src/data/moves_info.h') || getFile(files, 'src/data/battle_moves.h');

  if (!battleMovesFile) {
    console.warn('[Parser] Could not find moves_info.h or battle_moves.h');
    return {};
  }

  const attacks: Record<string, ParsedAttack> = {};

  // Slice between [MOVE_*] = { headers so we always get the full struct
  const splitRegex = /\[\s*(MOVE_[A-Z0-9_]+)\s*\]\s*=\s*\{/g;
  let m: RegExpExecArray | null;
  const positions: Array<{ key: string; bodyStart: number }> = [];

  while ((m = splitRegex.exec(battleMovesFile)) !== null) {
    positions.push({ key: m[1], bodyStart: m.index + m[0].length });
  }

  for (let i = 0; i < positions.length; i++) {
    const { key, bodyStart } = positions[i];
    const bodyEnd = i + 1 < positions.length ? positions[i + 1].bodyStart : battleMovesFile.length;
    const body = battleMovesFile.slice(bodyStart, bodyEnd);

    const name = key
      .replace('MOVE_', '')
      .replace(/_/g, ' ')
      .toLowerCase()
      .replace(/\b\w/g, (c) => c.toUpperCase());

    const attack: ParsedAttack = { key, name };

    // ── Numeric fields ────────────────────────────────────────────────────────
    extractNumber(body, 'power', attack);
    extractNumber(body, 'accuracy', attack);
    extractNumber(body, 'pp', attack);
    extractNumber(body, 'priority', attack);
    extractNumber(body, 'secondaryEffectChance', attack);

    // ── Identifier fields ─────────────────────────────────────────────────────
    extractIdentifier(body, 'type', attack);
    extractIdentifier(body, 'effect', attack);
    extractIdentifier(body, 'target', attack);
    extractIdentifier(body, 'split', attack);
    extractIdentifier(body, 'category', attack);

    // ── Description ───────────────────────────────────────────────────────────
    const descMatch = body.match(/\.description\s*=\s*COMPOUND_STRING\s*\(([\s\S]*?)\)/);
    if (descMatch) {
      const strings = [...descMatch[1].matchAll(/"([^"]*)"/g)].map((s) => s[1]);
      attack.description = strings.join(' ').replace(/\\n/g, ' ').replace(/\s+/g, ' ').trim();
    }

    // ── Boolean flags (parse all TRUE-valued ones into a Set) ─────────────────
    const foundFlags = new Set<string>();
    for (const flag of BOOLEAN_FLAGS) {
      // Match   .flagName = TRUE   (allow spaces, ignore FALSE and conditional)
      const flagRe = new RegExp(`\\.${flag}\\s*=\\s*TRUE\\b`);
      if (flagRe.test(body)) foundFlags.add(flag);
    }
    if (foundFlags.size > 0) attack.booleanFlags = foundFlags;

    // ── Legacy .flags = FLAG_A | FLAG_B  (older vanilla format) ──────────────
    const flagsMatch = body.match(/\.flags\s*=\s*([^,\n]+)/);
    if (flagsMatch) {
      const legacyFlags = flagsMatch[1]
        .split('|')
        .map((f) => f.trim())
        .filter((f) => f && f !== '0');
      if (legacyFlags.length) attack.legacyFlags = legacyFlags;
    }

    // ── Additional effects (secondary effects with a chance) ─────────────────
    // Extract ADDITIONAL_EFFECTS({ .moveEffect = MOVE_EFFECT_BURN, .chance = 10 })
    const addlBlock = body.match(/ADDITIONAL_EFFECTS\s*\(([\s\S]*?)\)\s*[,\n]/);
    if (addlBlock) {
      const inner = addlBlock[1];
      const effects: { effect: string; label: string; chance?: number }[] = [];
      // Each effect block is { .moveEffect = X, .chance = N }
      const effectBlockRe = /\{([^}]+)\}/g;
      let eb: RegExpExecArray | null;
      while ((eb = effectBlockRe.exec(inner)) !== null) {
        const block = eb[1];
        const effMatch = block.match(/\.moveEffect\s*=\s*([A-Z0-9_?:>\s=()]+?)[\s,\n]/);
        const chanceMatch = block.match(/\.chance\s*=\s*([^,\n]+)/);
        if (effMatch) {
          // Resolve ternary — take last integer
          const effRaw = effMatch[1].trim();
          let effKey = effRaw;
          if (effRaw.includes('?')) {
            // const nums = [...effRaw.matchAll(/\b(\d+)\b/g)].map((x) => x[1]);
            effKey = effRaw.match(/MOVE_EFFECT_[A-Z0-9_]+/)?.[0] ?? effRaw;
          }
          const label =
            MOVE_EFFECT_LABELS[effKey] ??
            effKey
              .replace('MOVE_EFFECT_', '')
              .replace(/_/g, ' ')
              .toLowerCase()
              .replace(/\b\w/g, (c) => c.toUpperCase());
          let chance: number | undefined;
          if (chanceMatch) {
            const nums = [...chanceMatch[1].matchAll(/\b(\d+)\b/g)].map((x) => Number(x[1]));
            if (nums.length) chance = nums[nums.length - 1]; // last = vanilla/fallback
          }
          effects.push({ effect: effKey, label, chance });
        }
      }
      if (effects.length) attack.additionalEffects = effects;
    }

    attacks[key] = attack;
  }

  return attacks;
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------
function extractNumber(body: string, field: keyof ParsedAttack, target: ParsedAttack) {
  const regex = new RegExp(`\\.${field}\\s*=\\s*([^,\\n]+)`);
  const m = body.match(regex);
  if (m) {
    let valStr = m[1].trim();
    if (valStr.includes('?')) valStr = valStr.split('?')[1].split(':')[0].trim();
    const match = valStr.match(/-?\d+/);
    if (match) (target as any)[field] = Number(match[0]);
  }
}

function extractIdentifier(body: string, field: keyof ParsedAttack, target: ParsedAttack) {
  const regex = new RegExp(`\\.${field}\\s*=\\s*([^,\\n]+)`);
  const m = body.match(regex);
  if (m) {
    let valStr = m[1].trim();
    if (valStr.includes('?')) valStr = valStr.split('?')[1].split(':')[0].trim();
    const idMatch = valStr.match(/([A-Z][A-Z0-9_]+)/);
    if (idMatch) (target as any)[field] = idMatch[1];
  }
}
