import type { FileContent } from '../../fileReader';
import { getFile } from './utils';

export type RawIdentifier = string;

export interface ParsedAbility {
  key: RawIdentifier;
  name?: string;
  description?: string;
}

type Args = { files: Map<string, FileContent> };

export function parseAbilities({ files }: Args): Record<RawIdentifier, ParsedAbility> {
  // Expansion uses abilities.h in the root of the data folder now
  const abilitiesFile =
    getFile(files, 'src/data/abilities.h') || getFile(files, 'src/data/text/abilities.h');
  const abilities: Record<string, ParsedAbility> = {};

  if (!abilitiesFile) {
    console.warn('[Parser] Could not find abilities.h');
    return abilities;
  }

  // Parses the modern single-struct array format
  const blockRegex = /\[\s*(ABILITY_[A-Z0-9_]+)\s*\]\s*=\s*\{([\s\S]*?)\n\s*\}/g;
  let match;

  while ((match = blockRegex.exec(abilitiesFile))) {
    const key = match[1];
    const body = match[2];

    // Match .name = _("Stench")
    const nameMatch = body.match(/\.name\s*=\s*_\("([^"]+)"\)/);

    // Match .description = COMPOUND_STRING("...") or _("...")
    const descMatch = body.match(/\.description\s*=\s*(?:COMPOUND_STRING|_)\("([^"]+)"\)/);

    abilities[key] = {
      key,
      name: nameMatch ? nameMatch[1] : key.replace('ABILITY_', ''),
      description: descMatch ? descMatch[1].replace(/\\n/g, ' ') : '', // clean up newline characters
    };
  }

  return abilities;
}
