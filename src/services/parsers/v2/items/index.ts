/* eslint-disable @typescript-eslint/no-explicit-any */
import type { FileContent } from '../../../fileReader';
import { getFile } from '../utils';
import type { ParsedItem, RawIdentifier } from './types';

type Args = { files: Map<string, FileContent> };

export function parseItems({ files }: Args): Record<RawIdentifier, ParsedItem> {
  // Expansion renamed it to items_info.h at some point, so we check both
  const itemsFile = getFile(files, 'src/data/items_info.h') || getFile(files, 'src/data/items.h');
  const itemScriptsFile = getFile(files, 'data/scripts/item_ball_scripts.inc');

  const items: Record<string, ParsedItem> = {};

  if (itemsFile) {
    parseItemDefinitions(itemsFile, items);
  }
  if (itemScriptsFile) {
    parseItemLocations(itemScriptsFile, items);
  }

  return items;
}

/* ---------------- item definitions ---------------- */
function parseItemDefinitions(content: string, items: Record<string, ParsedItem>) {
  // Loosened block regex to catch the whole struct
  const itemBlockRegex = /\[\s*(ITEM_[A-Z0-9_]+)\s*\]\s*=\s*\{([\s\S]*?)\n\s*\}/g;
  let match: RegExpExecArray | null;

  while ((match = itemBlockRegex.exec(content)) !== null) {
    const key = match[1];
    const body = match[2];

    // Safely parse name, handling `_("Name")` or `COMPOUND_STRING("Name")` or plain `"Name"`
    const nameMatch =
      body.match(/\.name\s*=\s*(?:_|COMPOUND_STRING)?\(\s*"([^"]+)"\s*\)/) ||
      body.match(/\.name\s*=\s*"([^"]+)"/);

    // Bulletproof Fallback: ITEM_POKE_BALL -> Poke Ball
    const fallbackName = key
      .replace('ITEM_', '')
      .replace(/_/g, ' ')
      .toLowerCase()
      .replace(/\b\w/g, (c) => c.toUpperCase());

    const item: ParsedItem = {
      key,
      name: nameMatch ? nameMatch[1].replace('{E_ACUTE}', 'é') : fallbackName,
      locations: [],
    };

    extractNumber(body, 'price', item);
    extractNumber(body, 'flingPower', item);

    extractIdentifier(body, 'pocket', item);
    extractIdentifier(body, 'holdEffect', item);
    extractIdentifier(body, 'fieldUseFunc', item);
    extractIdentifier(body, 'battleUsage', item);
    extractIdentifier(body, 'battleUseFunc', item);

    // Extract Description manually to bypass COMPOUND_STRING macro
    const descMatch = body.match(/\.description\s*=\s*(?:COMPOUND_STRING|_)?\(\s*"([^"]+)"\s*\)/);
    if (descMatch) {
      item.description = descMatch[1].replace(/\\n/g, ' ');
    }

    const typeMatch = body.match(/\.type\s*=\s*([^,\n]+)/);
    if (typeMatch) item.type = typeMatch[1].trim();

    const secondaryIdMatch = body.match(/\.secondaryId\s*=\s*([^,\n]+)/);
    if (secondaryIdMatch) item.secondaryId = secondaryIdMatch[1].trim();

    items[key] = item;
  }
}

/* ---------------- item locations ---------------- */
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

/* ---------------- helpers ---------------- */
function extractNumber(body: string, field: keyof ParsedItem, target: ParsedItem) {
  const m = body.match(new RegExp(`\\.${field}\\s*=\\s*(-?\\d+)`));
  if (m) (target as any)[field] = Number(m[1]);
}

function extractIdentifier(body: string, field: keyof ParsedItem, target: ParsedItem) {
  const m = body.match(new RegExp(`\\.${field}\\s*=\\s*([A-Z0-9_]+)`));
  if (m) (target as any)[field] = m[1];
}
