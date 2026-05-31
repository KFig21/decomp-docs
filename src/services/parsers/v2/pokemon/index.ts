/* eslint-disable @typescript-eslint/no-explicit-any */
import { parseSpeciesConstants } from './parsers/speciesContants';
import { getFile } from '../utils';
import type { FileContent } from '../../../fileReader';
import type { ParsedItem } from '../items/types';
import type { ParsedAttack } from '../moves/types';
import type { ParsedAbility } from '../abilities';

export function parsePokemon(
  files: Map<string, FileContent>,
  items: Record<string, ParsedItem>,
  moves: Record<string, ParsedAttack>,
  abilities: Record<string, ParsedAbility>,
): Record<string, any> {
  // 1. Setup base pokemon keys
  const pokemonSpeciesFile = getFile(files, 'include/constants/species.h')!;
  const pokemon = parseSpeciesConstants(pokemonSpeciesFile);

  // 2. Pre-parse all Level-Up Learnsets into a pointer map
  const levelUpLearnsets: Record<string, any[]> = {};

  // LOOSE REGEX: Matches `sBagonLevelUpLearnset[] = { ... };` regardless of struct types or u16 modifiers
  const learnsetRegex = /(s[A-Za-z0-9_]+LevelUpLearnset)\[\]\s*=\s*\{([\s\S]*?)\};/g;

  // LOOSE REGEX: Matches the LEVEL_UP_MOVE macro and handles spaces natively
  const moveRegex = /LEVEL_UP_MOVE\s*\(\s*(\d+)\s*,\s*([A-Z0-9_]+)\s*\)/g;

  // Scan all data files to catch learnsets across all gen_X.h files
  const pokemonDataFiles = Array.from(files.entries())
    .filter(([path]) => path.includes('src/data/pokemon'))
    .map(([path, content]) => ({ path, content: typeof content === 'string' ? content : '' }));

  console.log(`[Learnset Debug] Found ${pokemonDataFiles.length} files in src/data/pokemon`);

  let totalLearnsetsFound = 0;
  let totalMovesMapped = 0;
  const missedMoves = new Set<string>();

  for (const { path, content } of pokemonDataFiles) {
    let learnsetMatch;
    let fileLearnsetCount = 0;

    while ((learnsetMatch = learnsetRegex.exec(content))) {
      fileLearnsetCount++;
      totalLearnsetsFound++;

      const pointerName = learnsetMatch[1];
      const body = learnsetMatch[2];
      const entries = [];

      let moveMatch;
      while ((moveMatch = moveRegex.exec(body))) {
        const lvl = Number(moveMatch[1]);
        let moveKey = moveMatch[2];

        // Ensure MOVE_ prefix exists just in case the macro omits it
        if (!moveKey.startsWith('MOVE_')) {
          moveKey = `MOVE_${moveKey}`;
        }

        if (moves[moveKey]) {
          entries.push({ lvl, move: moves[moveKey] });
          totalMovesMapped++;
        } else {
          missedMoves.add(moveKey);
        }
      }

      levelUpLearnsets[pointerName] = entries;

      // Specifically track Bagon to see if it's being parsed correctly
      if (pointerName.includes('Bagon')) {
        console.log(
          `[Learnset Debug] Parsed ${pointerName} from ${path} with ${entries.length} moves.`,
        );
      }
    }

    if (fileLearnsetCount > 0) {
      console.log(`[Learnset Debug] Parsed ${fileLearnsetCount} learnsets from ${path}`);
    }
  }

  console.log(`[Learnset Debug] Total Learnsets Found: ${totalLearnsetsFound}`);
  console.log(`[Learnset Debug] Total Moves Successfully Mapped: ${totalMovesMapped}`);

  if (missedMoves.size > 0) {
    console.warn(
      `[Learnset Debug] Some moves were found in learnsets but NOT in the parsed moves dictionary:`,
      Array.from(missedMoves).slice(0, 15),
    );
  }

  // 3. Scan all files inside the species_info directory
  const infoFiles = Array.from(files.entries())
    .filter(([path]) => path.includes('src/data/pokemon/species_info'))
    .map(([, content]) => (typeof content === 'string' ? content : ''));

  // 4. Extract consolidated data from species_info blocks
  for (const file of infoFiles) {
    const matches = [...file.matchAll(/\[\s*(SPECIES_[A-Z0-9_]+)\s*\]\s*=\s*\{/g)];

    for (let i = 0; i < matches.length; i++) {
      const speciesKey = matches[i][1];
      if (!pokemon[speciesKey]) continue;

      const start = matches[i].index! + matches[i][0].length;
      const end = i + 1 < matches.length ? matches[i + 1].index! : file.length;
      const body = file.slice(start, end);

      // Name
      const nameMatch = body.match(/\.speciesName\s*=\s*_\("([^"]+)"\)/);
      if (nameMatch) pokemon[speciesKey].name = nameMatch[1];

      // Base Stats
      const readStat = (stat: string) =>
        Number(body.match(new RegExp(`\\.${stat}\\s*=\\s*(\\d+)`))?.[1] || 0);
      pokemon[speciesKey].baseStats = {
        hp: readStat('baseHP'),
        attack: readStat('baseAttack'),
        defense: readStat('baseDefense'),
        spAttack: readStat('baseSpAttack'),
        spDefense: readStat('baseSpDefense'),
        speed: readStat('baseSpeed'),
      };

      // Typings
      const typesMatch = body.match(/\.types\s*=\s*MON_TYPES\(([^)]+)\)/);
      if (typesMatch) {
        const t = typesMatch[1].split(',').map((s) => s.trim());
        pokemon[speciesKey].types = [t[0], t[1] || null] as any;
      }

      // Abilities
      const abilitiesMatch = body.match(/\.abilities\s*=\s*\{([^}]+)\}/);
      if (abilitiesMatch) {
        const abilityKeys = abilitiesMatch[1]
          .split(',')
          .map((a) => a.trim())
          .filter((a) => a !== 'ABILITY_NONE');
        pokemon[speciesKey].abilities = abilityKeys.map((k) => abilities[k]).filter(Boolean);
      }

      // Attach Level Up Learnsets
      const explicitLearnsetMatch = body.match(/\.levelUpLearnset\s*=\s*([a-zA-Z0-9_]+)/);
      let pointer = explicitLearnsetMatch ? explicitLearnsetMatch[1] : null;

      // Dynamically generate the fallback pointer
      if (!pointer) {
        const camelCase = speciesKey
          .replace('SPECIES_', '')
          .split('_')
          .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
          .join('');
        pointer = `s${camelCase}LevelUpLearnset`;
      }

      // Link the learnset to the Pokémon
      if (levelUpLearnsets[pointer]) {
        pokemon[speciesKey].levelUpLearnset = levelUpLearnsets[pointer];

        if (speciesKey === 'SPECIES_BAGON') {
          console.log(
            `[Learnset Debug] Successfully linked ${levelUpLearnsets[pointer].length} moves to SPECIES_BAGON via pointer: ${pointer}`,
          );
        }
      } else {
        if (speciesKey === 'SPECIES_BAGON' || speciesKey === 'SPECIES_BULBASAUR') {
          console.warn(
            `[Learnset Debug] MISSING LEARNSET! Could not find pointer: "${pointer}" for ${speciesKey}`,
          );
        }
      }
    }
  }

  return pokemon;
}
