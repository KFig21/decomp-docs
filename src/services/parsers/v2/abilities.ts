import { getFile } from './utils';

export type RawIdentifier = string;

export interface ParsedAbility {
  key: RawIdentifier;
  name?: string;
  description?: string;
}

type Args = {
  files: Map<string, string>;
};

export function parseAbilities({ files }: Args): Record<RawIdentifier, ParsedAbility> {
  const abilitiesFile = getFile(files, 'src/data/text/abilities.h');
  const abilities: Record<string, ParsedAbility> = {};

  if (!abilitiesFile) return abilities;

  // Step 1: parse description string constants
  const descriptionStrings = parseAbilityDescriptionStrings(abilitiesFile);

  // Step 2: parse ability names
  parseAbilityNames(abilitiesFile, abilities);

  // Step 3: parse description pointer table
  parseAbilityDescriptionPointers(abilitiesFile, abilities, descriptionStrings);

  return abilities;
}

/* ---------------- HELPER FUNCTIONS ---------------- */

/* ---------------- ability names ---------------- */

function parseAbilityNames(content: string, abilities: Record<string, ParsedAbility>) {
  /**
   * [ABILITY_STENCH] = _("Stench"),
   */
  const nameBlockMatch = content.match(/gAbilityNames\[ABILITIES_COUNT\][\s\S]*?\{([\s\S]*?)\};/);

  if (!nameBlockMatch) return;

  const block = nameBlockMatch[1];

  const entryRegex = /\[(ABILITY_[A-Z0-9_]+)\]\s*=\s*_\("([^"]+)"\)/g;

  let match: RegExpExecArray | null;

  while ((match = entryRegex.exec(block)) !== null) {
    const key = match[1];
    const name = match[2];

    if (!abilities[key]) {
      abilities[key] = { key };
    }

    abilities[key].name = name;
  }
}

/* ---------------- ability descriptions ---------------- */

function parseAbilityDescriptionStrings(content: string): Record<string, string> {
  /**
   * static const u8 sStenchDescription[] = _("May cause a foe to flinch.");
   */
  const map: Record<string, string> = {};

  const regex = /static const u8\s+(s[A-Za-z0-9_]+Description)\[\]\s*=\s*_\("([^"]+)"\);/g;

  let match: RegExpExecArray | null;

  while ((match = regex.exec(content)) !== null) {
    const key = match[1];
    const text = match[2];
    map[key] = text;
  }

  return map;
}

/* ---------------- ability description pointers ---------------- */

function parseAbilityDescriptionPointers(
  content: string,
  abilities: Record<string, ParsedAbility>,
  descriptionStrings: Record<string, string>,
) {
  /**
   * [ABILITY_STENCH] = sStenchDescription,
   */
  const pointerBlockMatch = content.match(
    /gAbilityDescriptionPointers\[ABILITIES_COUNT\][\s\S]*?\{([\s\S]*?)\};/,
  );

  if (!pointerBlockMatch) return;

  const block = pointerBlockMatch[1];

  const entryRegex = /\[(ABILITY_[A-Z0-9_]+)\]\s*=\s*(s[A-Za-z0-9_]+Description)/g;

  let match: RegExpExecArray | null;

  while ((match = entryRegex.exec(block)) !== null) {
    const abilityKey = match[1];
    const descriptionKey = match[2];

    const description = descriptionStrings[descriptionKey];
    if (!description) continue;

    if (!abilities[abilityKey]) {
      abilities[abilityKey] = { key: abilityKey };
    }

    abilities[abilityKey].description = description;
  }
}
