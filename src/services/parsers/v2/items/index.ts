/* eslint-disable @typescript-eslint/no-explicit-any */
import type { FileContent } from '../../../fileReader';
import { getFile } from '../utils';
import type { ParsedItem, RawIdentifier, PocketCategory } from './types';

type Args = { files: Map<string, FileContent> };

export function parseItems({ files }: Args): Record<RawIdentifier, ParsedItem> {
  const itemsFile = getFile(files, 'src/data/items_info.h') || getFile(files, 'src/data/items.h');
  const itemScriptsFile = getFile(files, 'data/scripts/item_ball_scripts.inc');
  const items: Record<string, ParsedItem> = {};

  if (itemsFile) parseItemDefinitions(itemsFile, items);
  if (itemScriptsFile) parseItemLocations(itemScriptsFile, items);

  return items;
}

// ---------------------------------------------------------------------------
// Pocket constant -> canonical category
// ---------------------------------------------------------------------------
const POCKET_MAP: Record<string, PocketCategory> = {
  POCKET_ITEMS: 'items',
  POCKET_MEDICINE: 'items',
  POCKET_BERRIES: 'berries',
  POCKET_POKE_BALLS: 'balls',
  POCKET_TM_HM: 'tms',
  POCKET_TM_CASE: 'tms',
  POCKET_BATTLE_ITEMS: 'items',
  POCKET_KEY_ITEMS: 'key-items',
  POCKET_CANDY: 'items',
};

function resolvePocket(raw: string | undefined): PocketCategory {
  if (!raw) return 'items';
  return POCKET_MAP[raw.trim()] ?? 'items';
}

// ---------------------------------------------------------------------------
// In-game text token replacements
// ---------------------------------------------------------------------------
const TOKEN_MAP: Record<string, string> = {
  POKEBLOCK: 'PokéBlock',
  E_ACUTE: 'é',
  PLAYER: 'Player',
  RIVAL: 'Rival',
  COLOR: '',
  SHADOW: '',
  DYNAMIC: '',
};

function resolveTokens(str: string): string {
  return str.replace(/\{([A-Z0-9_]+)\}/g, (_, token) => TOKEN_MAP[token] ?? `{${token}}`);
}

// ---------------------------------------------------------------------------
// #if / #elif / #else / #endif block normaliser
//
// The Emerald Expansion uses feature-flag #if blocks extensively:
//
//   #if I_KEY_ESCAPE_ROPE >= GEN_8
//     .price = 0,
//     .pocket = POCKET_KEY_ITEMS,
//   #else
//     .price = (I_PRICE >= GEN_7) ? 1000 : 550,
//     .pocket = POCKET_ITEMS,
//   #endif
//
// We want the ELSE / last branch – that's the vanilla GEN_3 behaviour,
// which is what an Emerald rom hack reader expects.
//
// Strategy:
//   1. Find every #if...#endif block in the body.
//   2. Replace each block with ONLY the text of its last branch
//      (#else if present, otherwise the first/only branch as fallback).
//   3. Return the normalised body for further field extraction.
// ---------------------------------------------------------------------------
function normalizeIfdefBlocks(body: string): string {
  // Iteratively collapse innermost #if...#endif blocks so nesting works.
  // We stop when no more blocks are found.
  let result = body;
  const blockRe = /#if\b[^\n]*\n([\s\S]*?)#endif\b[^\n]*/g;

  let pass = 0;
  while (pass++ < 20) {
    // safety cap against infinite loops
    const next = result.replace(blockRe, (_full, inner: string) => {
      // Split on #else or #elif boundaries (keep it simple: any #else/#elif starts a new branch)
      // We split on lines that start with #else or #elif
      const branches = inner.split(/^#(?:else|elif)\b[^\n]*/m);
      // Pick the LAST branch (the #else / most-vanilla fallback)
      return branches[branches.length - 1] ?? '';
    });

    if (next === result) break; // nothing changed, done
    result = next;
  }

  return result;
}

// ---------------------------------------------------------------------------
// Price resolver (operates on already-normalised body)
//
// After ifdef normalisation the price line looks like one of:
//   .price = 550,                            plain
//   .price = (I_PRICE >= GEN_7) ? 1000 : 550,   ternary
//   .price = 8000 * TREASURE_FACTOR : 7500,      complex ternary
//
// Strategy: collect ALL integer tokens on the rhs, return the LAST one
// (the else/false/vanilla branch).
// ---------------------------------------------------------------------------
function resolvePrice(priceRhs: string): number | undefined {
  const nums = [...priceRhs.matchAll(/\b(\d+)\b/g)].map((m) => Number(m[1]));
  if (nums.length === 0) return undefined;
  return nums[nums.length - 1];
}

// ---------------------------------------------------------------------------
// Description dictionary  (static const u8 sXxxDesc[] = _("..."))
// ---------------------------------------------------------------------------
function buildDescriptionDictionary(content: string): Record<string, string> {
  const dict: Record<string, string> = {};

  const dictRegex =
    /static\s+const\s+u8\s+([A-Za-z0-9_]+)\s*\[\s*\]\s*=\s*(?:_|COMPOUND_STRING)\s*\(([\s\S]*?)\)\s*;/g;
  let m: RegExpExecArray | null;

  while ((m = dictRegex.exec(content)) !== null) {
    const varName = m[1];
    const inner = m[2];
    const strings = [...inner.matchAll(/"([^"]*)"/g)].map((s) => s[1]);
    dict[varName] = resolveTokens(
      strings.join(' ').replace(/\\n/g, ' ').replace(/\s+/g, ' ').trim(),
    );
  }

  return dict;
}

// ---------------------------------------------------------------------------
// Description resolver
// ---------------------------------------------------------------------------
function resolveDescription(body: string, dict: Record<string, string>): string | undefined {
  // A) COMPOUND_STRING / _() — possibly multi-line
  const blockMatch = body.match(
    /\.description\s*=\s*(?:COMPOUND_STRING|_)\s*\(([\s\S]*?)\)(?:\s*,|\s*$)/,
  );
  if (blockMatch) {
    const strings = [...blockMatch[1].matchAll(/"([^"]*)"/g)].map((s) => s[1]);
    if (strings.length > 0) {
      return resolveTokens(strings.join(' ').replace(/\\n/g, ' ').replace(/\s+/g, ' ').trim());
    }
  }

  // B) Plain string literal
  const rawMatch = body.match(/\.description\s*=\s*"([^"]+)"/);
  if (rawMatch) return resolveTokens(rawMatch[1].replace(/\\n/g, ' ').trim());

  // C) Identifier reference (e.g. sEvolutionStoneDesc)
  const refMatch = body.match(/\.description\s*=\s*([A-Za-z_][A-Za-z0-9_]*)\s*,/);
  if (refMatch) return dict[refMatch[1]];

  return undefined;
}

// ---------------------------------------------------------------------------
// Item definition parsing
// ---------------------------------------------------------------------------
function parseItemDefinitions(content: string, items: Record<string, ParsedItem>) {
  const descDict = buildDescriptionDictionary(content);

  const splitRegex = /\[\s*(ITEM_[A-Z0-9_]+)\s*\]\s*=\s*\{/g;
  let m: RegExpExecArray | null;
  const positions: Array<{ key: string; bodyStart: number }> = [];

  while ((m = splitRegex.exec(content)) !== null) {
    positions.push({ key: m[1], bodyStart: m.index + m[0].length });
  }

  for (let i = 0; i < positions.length; i++) {
    const { key, bodyStart } = positions[i];
    const bodyEnd = i + 1 < positions.length ? positions[i + 1].bodyStart : content.length;

    // Raw body for description (must read COMPOUND_STRING before ifdef removal)
    const rawBody = content.slice(bodyStart, bodyEnd);

    // Normalised body for all other fields — #if blocks collapsed to last branch
    const body = normalizeIfdefBlocks(rawBody);

    // ── Name ──────────────────────────────────────────────────────────────────
    const nameMatch =
      body.match(/\.name\s*=\s*(?:ITEM_NAME|_|COMPOUND_STRING)?\(\s*"([^"]+)"\s*\)/) ||
      body.match(/\.name\s*=\s*"([^"]+)"/);

    const fallbackName = key
      .replace('ITEM_', '')
      .replace(/_/g, ' ')
      .toLowerCase()
      .replace(/\b\w/g, (c) => c.toUpperCase());

    const item: ParsedItem = {
      key,
      name: nameMatch ? resolveTokens(nameMatch[1].replace('{E_ACUTE}', 'é')) : fallbackName,
      locations: [],
    };

    // ── Description ───────────────────────────────────────────────────────────
    // Use rawBody so COMPOUND_STRING blocks that span ifdef boundaries are intact.
    item.description = resolveDescription(rawBody, descDict);

    // ── Price (from normalised body — ifdef collapsed to vanilla branch) ───────
    const priceLineMatch = body.match(/\.price\s*=\s*([^\n,;]+)/);
    if (priceLineMatch) {
      const resolved = resolvePrice(priceLineMatch[1]);
      if (resolved !== undefined) {
        item.price = resolved;
        item.sellPrice = Math.floor(resolved / 2);
      }
    }

    // ── Pocket (from normalised body) ─────────────────────────────────────────
    const pocketMatch = body.match(/\.pocket\s*=\s*([A-Z_]+)/);
    if (pocketMatch) {
      item.pocket = pocketMatch[1];
      item.pocketCategory = resolvePocket(pocketMatch[1]);
    }

    extractNumber(body, 'flingPower', item);
    extractIdentifier(body, 'holdEffect', item);
    extractIdentifier(body, 'fieldUseFunc', item);
    extractIdentifier(body, 'battleUsage', item);
    extractIdentifier(body, 'battleUseFunc', item);

    const typeMatch = body.match(/\.type\s*=\s*([^,\n]+)/);
    if (typeMatch) item.type = typeMatch[1].trim();

    const secondaryIdMatch = body.match(/\.secondaryId\s*=\s*([^,\n]+)/);
    if (secondaryIdMatch) item.secondaryId = secondaryIdMatch[1].trim();

    items[key] = item;
  }
}

// ---------------------------------------------------------------------------
// Item ball script locations
// ---------------------------------------------------------------------------
function parseItemLocations(content: string, items: Record<string, ParsedItem>) {
  const scriptRegex = /([A-Za-z0-9_]+)::\s*\n\s*finditem\s+(ITEM_[A-Z0-9_]+)/g;
  let match: RegExpExecArray | null;

  while ((match = scriptRegex.exec(content)) !== null) {
    const scriptName = match[1];
    const itemKey = match[2];

    if (!items[itemKey]) {
      items[itemKey] = {
        key: itemKey,
        name: itemKey
          .replace('ITEM_', '')
          .replace(/_/g, ' ')
          .toLowerCase()
          .replace(/\b\w/g, (c) => c.toUpperCase()),
        locations: [],
      };
    }
    items[itemKey].locations.push({ mapScript: scriptName });
  }
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------
function extractNumber(body: string, field: keyof ParsedItem, target: ParsedItem) {
  const m = body.match(new RegExp(`\\.${field}\\s*=\\s*(-?\\d+)`));
  if (m) (target as any)[field] = Number(m[1]);
}

function extractIdentifier(body: string, field: keyof ParsedItem, target: ParsedItem) {
  const m = body.match(new RegExp(`\\.${field}\\s*=\\s*([A-Z0-9_]+)`));
  if (m) (target as any)[field] = m[1];
}
