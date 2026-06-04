/* eslint-disable @typescript-eslint/no-explicit-any */
import { parseSpeciesConstants } from './parsers/speciesContants';
import { getFile } from '../utils';
import type { FileContent } from '../../../fileReader';
import type { ParsedItem } from '../items/types';
import type { ParsedAttack } from '../moves/types';
import type { ParsedAbility } from '../abilities';
import { parseTMHMLearnsets } from './parsers/tmhmLearnsets';

export function parsePokemon(
  files: Map<string, FileContent>,
  items: Record<string, ParsedItem>,
  moves: Record<string, ParsedAttack>,
  abilities: Record<string, ParsedAbility>,
): Record<string, any> {
  const pokemonSpeciesFile = getFile(files, 'include/constants/species.h')!;
  const pokemon = parseSpeciesConstants(pokemonSpeciesFile);

  const pokedexDict: Record<string, string> = {};
  const pokedexTextFiles = [
    getFile(files, 'src/data/pokemon/pokedex_text.h'),
    getFile(files, 'src/data/pokemon/species_info/shared_dex_text.h'), // Grab the shared fallback file!
  ];

  for (const textFile of pokedexTextFiles) {
    if (textFile) {
      // Make the _( or COMPOUND_STRING( completely optional so raw strings don't fail
      const descRegex =
        /const\s+u8\s+([A-Za-z0-9_]+)\[\]\s*=\s*(?:(?:_|\bCOMPOUND_STRING\b)\(\s*)?((?:"[^"]*"\s*)+)/g;
      let m;
      while ((m = descRegex.exec(textFile))) {
        const key = m[1];
        const text = m[2].replace(/"/g, '').replace(/\\n/g, ' ').replace(/\s+/g, ' ').trim();
        pokedexDict[key] = text;
      }
    }
  }

  // Parse pokedex.h to convert NATIONAL_DEX_PIKACHU to 25
  const pokedexConstantsFile = getFile(files, 'include/constants/pokedex.h');
  const natDexMap: Record<string, number> = {};
  if (pokedexConstantsFile) {
    const regex = /#define\s+(NATIONAL_DEX_[A-Z0-9_]+)\s+(\d+)/g;
    let m;
    while ((m = regex.exec(pokedexConstantsFile))) {
      natDexMap[m[1]] = parseInt(m[2], 10);
    }
  }

  const levelUpLearnsets: Record<string, any[]> = {};
  const learnsetRegex = /(s[A-Za-z0-9_]+LevelUpLearnset)\[\]\s*=\s*\{([\s\S]*?)\};/g;
  const moveRegex = /LEVEL_UP_MOVE\s*\(\s*(\d+)\s*,\s*([A-Z0-9_]+)\s*\)/g;

  const pokemonDataFiles = Array.from(files.entries())
    .filter(([path]) => path.includes('src/data/pokemon'))
    .map(([path, content]) => ({ path, content: typeof content === 'string' ? content : '' }));

  for (const { content } of pokemonDataFiles) {
    let learnsetMatch;
    while ((learnsetMatch = learnsetRegex.exec(content))) {
      const pointerName = learnsetMatch[1];
      const body = learnsetMatch[2];
      const entries = [];
      let moveMatch;
      while ((moveMatch = moveRegex.exec(body))) {
        const lvl = Number(moveMatch[1]);
        let moveKey = moveMatch[2];
        if (!moveKey.startsWith('MOVE_')) moveKey = `MOVE_${moveKey}`;
        if (moves[moveKey]) entries.push({ lvl, move: moves[moveKey] });
      }
      levelUpLearnsets[pointerName] = entries;
    }
  }

  // Parse TM/HM learnsets
  const tmhmLearnsets = parseTMHMLearnsets(files, items, moves);

  const infoFiles = Array.from(files.entries())
    .filter(([path]) => path.includes('src/data/pokemon/species_info'))
    .map(([, content]) => (typeof content === 'string' ? content : ''));

  for (const file of infoFiles) {
    const macros: Record<string, string> = {};
    const macroRegex = /#define\s+([A-Z0-9_]+)\s+([^/\n]+)/g;
    let macroMatch;

    // 1. MACRO FIX: Resolve ternaries while building the macro dictionary
    while ((macroMatch = macroRegex.exec(file))) {
      let valStr = macroMatch[2].trim();

      if (valStr.includes('?')) {
        // Ex: (P_UPDATED_TYPES >= GEN_6 ? TYPE_FAIRY : TYPE_PSYCHIC) -> TYPE_FAIRY
        valStr = valStr.split('?')[1].split(':')[0].replace(/[()]/g, '').trim();
      }

      if (!macros[macroMatch[1]]) {
        macros[macroMatch[1]] = valStr;
      }
    }

    const matches = [...file.matchAll(/\[\s*(SPECIES_[A-Z0-9_]+)\s*\]\s*=\s*\{/g)];

    for (let i = 0; i < matches.length; i++) {
      const speciesKey = matches[i][1];
      if (!pokemon[speciesKey]) continue;

      const start = matches[i].index! + matches[i][0].length;
      const end = i + 1 < matches.length ? matches[i + 1].index! : file.length;
      const body = file.slice(start, end);

      const nameMatch = body.match(/\.speciesName\s*=\s*_\("([^"]+)"\)/);
      if (nameMatch) pokemon[speciesKey].name = nameMatch[1];

      const descCompoundMatch = body.match(
        /\.description\s*=\s*COMPOUND_STRING\(\s*((?:"[^"]*"\s*)+)\)/,
      );

      if (descCompoundMatch) {
        pokemon[speciesKey].pokedexEntry = descCompoundMatch[1]
          .replace(/"/g, '')
          .replace(/\\n/g, ' ')
          .replace(/\s+/g, ' ')
          .trim();
      } else {
        const descMatch = body.match(/\.description\s*=\s*([A-Za-z0-9_]+)/);
        if (descMatch && pokedexDict[descMatch[1]]) {
          pokemon[speciesKey].pokedexEntry = pokedexDict[descMatch[1]];
        }
      }

      const readStat = (stat: string, altStat?: string) => {
        const regex = altStat
          ? `\\.(?:${stat}|${altStat})\\s*=\\s*([^,\\n]+)`
          : `\\.${stat}\\s*=\\s*([^,\\n]+)`;
        let valStr = body.match(new RegExp(regex))?.[1]?.trim();

        if (!valStr) return 0;
        if (macros[valStr]) valStr = macros[valStr];

        // Backup ternary catch for inline stats
        if (valStr.includes('?')) {
          const afterQuestion = valStr.split('?')[1];
          const match = afterQuestion.match(/\d+/);
          return match ? Number(match[0]) : 0;
        }
        const match = valStr.match(/\d+/);
        return match ? Number(match[0]) : 0;
      };

      // Map the raw constant to the integer
      const natDexMatch = body.match(/\.natDexNum\s*=\s*([A-Z0-9_]+)/);
      if (natDexMatch) {
        const rawNatDex = natDexMatch[1];
        // If we successfully found the number in pokedex.h, store the number. Otherwise, keep the string.
        pokemon[speciesKey].natDexNum =
          natDexMap[rawNatDex] !== undefined ? natDexMap[rawNatDex] : rawNatDex;
      }

      pokemon[speciesKey].baseStats = {
        hp: readStat('baseHP'),
        attack: readStat('baseAttack'),
        defense: readStat('baseDefense'),
        spAttack: readStat('baseSpAttack', 'baseSpAtk'),
        spDefense: readStat('baseSpDefense', 'baseSpDef'),
        speed: readStat('baseSpeed'),
      };

      // 2. TYPES FIX: Check the macros dictionary before assigning the type
      // Now matches either MON_TYPES(...) OR a raw macro identifier like JIGGLYPUFF_FAMILY_TYPES
      const typesMatch = body.match(/\.types\s*=\s*(?:MON_TYPES\(([^)]+)\)|([A-Z0-9_]+))/);

      if (typesMatch) {
        let typeStr = typesMatch[1] || typesMatch[2];

        // If the entire type string is a macro (e.g., JIGGLYPUFF_FAMILY_TYPES), resolve it
        if (macros[typeStr]) {
          typeStr = macros[typeStr];
        }

        // Clean up any curly braces returned by the macro (e.g., "{ TYPE_NORMAL, TYPE_FAIRY }")
        typeStr = typeStr.replace(/[{}]/g, '');

        const t = typeStr.split(',').map((s) => s.trim());

        // If t[0] or t[1] is a sub-macro (like RALTS_FAMILY_TYPE2), use the resolved value
        const type1 = macros[t[0]] || t[0];
        const type2 = t[1] ? macros[t[1]] || t[1] : null;

        pokemon[speciesKey].types = [type1, type2] as any;
      }

      const abilitiesMatch = body.match(/\.abilities\s*=\s*\{([^}]+)\}/);
      if (abilitiesMatch) {
        const abilityKeys = abilitiesMatch[1]
          .split(',')
          .map((a) => a.trim())
          .filter((a) => a !== 'ABILITY_NONE');
        pokemon[speciesKey].abilities = abilityKeys.map((k) => abilities[k]).filter(Boolean);
      }

      const explicitLearnsetMatch = body.match(/\.levelUpLearnset\s*=\s*([a-zA-Z0-9_]+)/);
      let pointer = explicitLearnsetMatch ? explicitLearnsetMatch[1] : null;

      if (!pointer) {
        const camelCase = speciesKey
          .replace('SPECIES_', '')
          .split('_')
          .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
          .join('');
        pointer = `s${camelCase}LevelUpLearnset`;
      }

      if (levelUpLearnsets[pointer]) {
        pokemon[speciesKey].levelUpLearnset = levelUpLearnsets[pointer];
      }

      // NEW: Attach TM/HM learnsets
      if (tmhmLearnsets[speciesKey]) {
        pokemon[speciesKey].tmhmLearnset = tmhmLearnsets[speciesKey];
      }

      const evosMatch = body.match(/\.evolutions\s*=\s*EVOLUTION\(([\s\S]*?)\)(?:,|\s*\n)/);
      if (evosMatch) {
        // Remove the trailing `\s*\}` requirement so CONDITIONS(...) doesn't break the match
        const evoDetails = [
          ...evosMatch[1].matchAll(
            /\{\s*(EVO_[A-Z0-9_]+)\s*,\s*([^,]+)\s*,\s*(SPECIES_[A-Z0-9_]+)/g,
          ),
        ];

        pokemon[speciesKey].evolutions = evoDetails.map((m) => ({
          method: m[1],
          param: m[2].trim(),
          targetSpecies: m[3],
        }));
      }
    }
  }

  // Pre-Evolutions mapping
  for (const mon of Object.values(pokemon)) {
    for (const evo of mon.evolutions) {
      if (pokemon[evo.targetSpecies]) {
        pokemon[evo.targetSpecies].preEvolutions.push(mon.key);
      }
    }
  }

  // Group variants by natDexNum before returning
  const groupedByNatDex: Record<string, any[]> = {};

  for (const mon of Object.values(pokemon)) {
    if (mon.natDexNum && mon.natDexNum !== 'NATIONAL_DEX_NONE') {
      if (!groupedByNatDex[mon.natDexNum]) {
        groupedByNatDex[mon.natDexNum] = [];
      }
      groupedByNatDex[mon.natDexNum].push(mon);
    }
  }

  for (const group of Object.values(groupedByNatDex)) {
    if (group.length > 1) {
      // Sort by key length.
      // Example: 'SPECIES_PIKACHU' (15 chars) will sort before 'SPECIES_PIKACHU_ALOLA' (21 chars)
      // This reliably isolates the base form.
      group.sort((a, b) => a.key.length - b.key.length);

      const base = group[0];
      base.variants = group.slice(1);

      // Give variants a reference to their base key
      base.variants.forEach((v: any) => (v.baseSpeciesKey = base.key));
    }
  }

  return pokemon;
}
