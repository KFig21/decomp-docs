/* eslint-disable @typescript-eslint/no-explicit-any */
import { getFile } from './utils';

export type RawIdentifier = string;

export interface ItemLocationRef {
  mapScript: string;
}

export interface ParsedItem {
  key: RawIdentifier;
  name?: string;
  price?: number;
  pocket?: RawIdentifier;
  type?: string | RawIdentifier;
  holdEffect?: RawIdentifier;
  description?: RawIdentifier;
  fieldUseFunc?: RawIdentifier;
  battleUsage?: RawIdentifier;
  battleUseFunc?: RawIdentifier;
  flingPower?: number;
  secondaryId?: string;

  locations: ItemLocationRef[];
}

type Args = {
  files: Map<string, string>;
};

export function parseItems({ files }: Args): Record<RawIdentifier, ParsedItem> {
  const itemsFile = getFile(files, 'src/data/items.h');
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
  const itemBlockRegex = /\[(ITEM_[A-Z0-9_]+)\]\s*=\s*\{([\s\S]*?)\n\s*\},/g;

  let match: RegExpExecArray | null;

  while ((match = itemBlockRegex.exec(content)) !== null) {
    const key = match[1];
    const body = match[2];

    const item: ParsedItem = {
      key,
      locations: [],
    };

    // Name: _("Rowap Berry")
    const nameMatch = body.match(/\.name\s*=\s*_\("([^"]+)"\)/);
    if (nameMatch) item.name = nameMatch[1];

    extractNumber(body, 'price', item);
    extractNumber(body, 'flingPower', item);

    extractIdentifier(body, 'pocket', item);
    extractIdentifier(body, 'holdEffect', item);
    extractIdentifier(body, 'description', item);
    extractIdentifier(body, 'fieldUseFunc', item);
    extractIdentifier(body, 'battleUsage', item);
    extractIdentifier(body, 'battleUseFunc', item);

    // type can be expression (ITEM_GREAT_BALL - FIRST_BALL)
    const typeMatch = body.match(/\.type\s*=\s*([^,\n]+)/);
    if (typeMatch) item.type = typeMatch[1].trim();

    const secondaryIdMatch = body.match(/\.secondaryId\s*=\s*([^,\n]+)/);
    if (secondaryIdMatch) item.secondaryId = secondaryIdMatch[1].trim();

    items[key] = item;
  }
}

/* ---------------- item locations ---------------- */

function parseItemLocations(content: string, items: Record<string, ParsedItem>) {
  /**
   * Route102_EventScript_ItemPotion::
   *   finditem ITEM_POTION
   */
  const scriptRegex = /([A-Za-z0-9_]+)::\s*\n\s*finditem\s+(ITEM_[A-Z0-9_]+)/g;

  let match: RegExpExecArray | null;

  while ((match = scriptRegex.exec(content)) !== null) {
    const scriptName = match[1];
    const itemKey = match[2];

    if (!items[itemKey]) {
      items[itemKey] = {
        key: itemKey,
        locations: [],
      };
    }

    items[itemKey].locations.push({
      mapScript: scriptName,
    });
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
