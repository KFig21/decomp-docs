import type { FileContent } from '../../../fileReader';
import { getFile } from '../utils';
import type { ParsedTypeChart } from './types';

type Args = { files: Map<string, FileContent> };

// ── File location ──────────────────────────────────────────────────────────────

function findTypeChartFile(files: Map<string, FileContent>): string | null {
  // Known candidate paths in priority order
  const candidates = [
    'src/data/types_info.h',
    'src/data/type_effectiveness.h',
    'data/type_effectiveness.h',
  ];
  for (const p of candidates) {
    const f = getFile(files, p);
    if (f && f.includes('gTypeEffectivenessTable')) return f;
  }
  // Fallback: scan any .h or .c file
  for (const [path, content] of files.entries()) {
    if (typeof content !== 'string') continue;
    if (!path.endsWith('.h') && !path.endsWith('.c')) continue;
    if (content.includes('gTypeEffectivenessTable')) return content;
  }
  return null;
}

// ── 2D array format parser ─────────────────────────────────────────────────────
//
// Modern pokeemerald-expansion format:
//
//   #define X UQ_4_12
//   #define ______ X(1.0)
//   #define STL_RS (cond ? X(1.0) : X(0.5))   // ternary – we take the TRUE branch
//
//   const uq4_12_t gTypeEffectivenessTable[N][N] =
//   {
//     [TYPE_NORMAL]   = { ______, ______, X(0.5), X(0.0), ... },
//     [TYPE_FIGHTING] = { X(2.0), ______, X(0.5), ... },
//     ...
//   };
//
// The column order matches the row order (same enum indexing for both dimensions).

function parse2DTable(raw: string): ParsedTypeChart | null {
  const tableStart = raw.indexOf('gTypeEffectivenessTable');
  if (tableStart === -1) return null;

  // ── 1. Extract conditional macro resolutions (take the "true" branch value) ──
  // Pattern: #define NAME (... ? X(trueVal) : X(falseVal))
  const macroValues: Record<string, number> = {};
  // Matches: #define NAME (... ? X(trueVal) ...) — captures NAME and trueVal
  // We use [\s\S]*? (non-greedy) to skip past any inner parens like GEN_6)
  const macroRegex = /#define\s+([A-Z0-9_]+)\s+\([\s\S]*?\?\s*(?:X|UQ_4_12)\(\s*([0-9.]+)\s*\)/g;
  let m: RegExpExecArray | null;
  const beforeTable = raw.slice(0, tableStart);
  while ((m = macroRegex.exec(beforeTable)) !== null) {
    macroValues[m[1]] = parseFloat(m[2]);
  }

  // ── 2. Extract the table body using brace-depth counting ──────────────────
  const openBrace = raw.indexOf('{', tableStart);
  if (openBrace === -1) return null;

  let depth = 0;
  let closeBrace = -1;
  for (let i = openBrace; i < raw.length; i++) {
    if (raw[i] === '{') depth++;
    else if (raw[i] === '}') {
      depth--;
      if (depth === 0) { closeBrace = i; break; }
    }
  }
  if (closeBrace === -1) return null;

  const tableBody = raw.slice(openBrace + 1, closeBrace);

  // ── 3. Parse rows: [TYPE_X] = { v0, v1, v2, ... } ────────────────────────
  const rowRegex = /\[\s*TYPE_([A-Z0-9_]+)\s*\]\s*=\s*\{([^}]+)\}/g;
  const rows: { typeName: string; rawValues: string[] }[] = [];

  while ((m = rowRegex.exec(tableBody)) !== null) {
    const typeName = m[1].toLowerCase();
    const rawValues = m[2].split(',').map((s) => s.trim()).filter(Boolean);
    rows.push({ typeName, rawValues });
  }

  if (rows.length === 0) return null;

  // ── 4. Type order = row declaration order ─────────────────────────────────
  // (Both dimensions share the same enum index, so column i = rows[i].typeName)
  const typeOrder = rows.map((r) => r.typeName);

  // ── 5. Resolve each cell to a multiplier ──────────────────────────────────
  const chart: ParsedTypeChart = {};

  for (const { typeName: attacker, rawValues } of rows) {
    for (let col = 0; col < rawValues.length; col++) {
      const defender = typeOrder[col];
      if (!defender) continue;

      const cell = rawValues[col];
      let mult: number | null = null;

      // ______ = X(1.0) = normal effectiveness — skip
      if (cell === '______') continue;

      // X(n) or UQ_4_12(n)
      const xMatch = cell.match(/(?:X|UQ_4_12)\(\s*([0-9.]+)\s*\)/);
      if (xMatch) {
        mult = parseFloat(xMatch[1]);
      } else {
        // Named macro (e.g. STL_RS, PSN_RS) — look up resolved value
        const namedMatch = cell.match(/^([A-Z0-9_]+)$/);
        if (namedMatch && macroValues[namedMatch[1]] !== undefined) {
          mult = macroValues[namedMatch[1]];
        }
      }

      if (mult === null || mult === 1) continue; // implicit or normal

      if (!chart[attacker]) chart[attacker] = {};
      chart[attacker][defender] = mult;
    }
  }

  return Object.keys(chart).length > 0 ? chart : null;
}

// ── Triplet format parser ──────────────────────────────────────────────────────
//
// Classic pokeemerald / older expansion format:
//
//   Struct triplets:  { TYPE_X, TYPE_Y, UQ_4_12(n) }
//   Byte-array rows:  TYPE_X, TYPE_Y, value   (0 = immune, 5 = 0.5×, 20 = 2×)

function parseTripletTable(raw: string): ParsedTypeChart | null {
  const typeKey = (s: string) => s.replace(/^TYPE_/i, '').toLowerCase();

  const chart: ParsedTypeChart = {};
  let found = 0;

  // Struct format
  const structRegex =
    /\{\s*(TYPE_[A-Z0-9_]+)\s*,\s*(TYPE_[A-Z0-9_]+)\s*,\s*(?:X|UQ_4_12)\(\s*([0-9.]+)\s*\)\s*\}/g;
  let m: RegExpExecArray | null;
  while ((m = structRegex.exec(raw)) !== null) {
    const [, ar, dr, ms] = m;
    if (/ENDTABLE|FORESIGHT/i.test(ar) || /ENDTABLE|FORESIGHT/i.test(dr)) continue;
    const mult = parseFloat(ms);
    if (mult === 1) continue;
    const a = typeKey(ar);
    const d = typeKey(dr);
    if (!chart[a]) chart[a] = {};
    chart[a][d] = mult;
    found++;
  }
  if (found > 0) return chart;

  // Byte-array format (values 0 / 5 / 20)
  const byteRegex = /(TYPE_[A-Z0-9_]+)\s*,\s*(TYPE_[A-Z0-9_]+)\s*,\s*(\d+)/g;
  while ((m = byteRegex.exec(raw)) !== null) {
    const [, ar, dr, vs] = m;
    if (/ENDTABLE|FORESIGHT/i.test(ar) || /ENDTABLE|FORESIGHT/i.test(dr)) continue;
    const v = parseInt(vs, 10);
    let mult: number;
    if (v === 0)       mult = 0;
    else if (v === 5)  mult = 0.5;
    else if (v === 20) mult = 2;
    else continue;
    const a = typeKey(ar);
    const d = typeKey(dr);
    if (!chart[a]) chart[a] = {};
    chart[a][d] = mult;
    found++;
  }

  return found > 0 ? chart : null;
}

// ── Main export ────────────────────────────────────────────────────────────────

export function parseTypeChart({ files }: Args): ParsedTypeChart | null {
  const raw = findTypeChartFile(files);
  if (!raw) return null;

  // Try the modern 2D-array format first, then fall back to the triplet format
  return parse2DTable(raw) ?? parseTripletTable(raw);
}
