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
  const pokedexTextFile = getFile(files, 'src/data/pokemon/pokedex_text.h');
  if (pokedexTextFile) {
    const descRegex = /const\s+u8\s+([A-Za-z0-9_]+)\[\]\s*=\s*_\(\s*((?:"[^"]*"\s*)+)\)/g;
    let m;
    while ((m = descRegex.exec(pokedexTextFile))) {
      const key = m[1];
      const text = m[2].replace(/"/g, '').replace(/\\n/g, ' ').replace(/\s+/g, ' ').trim();
      pokedexDict[key] = text;
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

      pokemon[speciesKey].baseStats = {
        hp: readStat('baseHP'),
        attack: readStat('baseAttack'),
        defense: readStat('baseDefense'),
        spAttack: readStat('baseSpAttack', 'baseSpAtk'),
        spDefense: readStat('baseSpDefense', 'baseSpDef'),
        speed: readStat('baseSpeed'),
      };

      // 2. TYPES FIX: Check the macros dictionary before assigning the type
      const typesMatch = body.match(/\.types\s*=\s*MON_TYPES\(([^)]+)\)/);
      if (typesMatch) {
        const t = typesMatch[1].split(',').map((s) => s.trim());

        // If t[0] or t[1] is a macro (like RALTS_FAMILY_TYPE2), use the resolved macro value
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
        const evoDetails = [
          ...evosMatch[1].matchAll(
            /\{\s*(EVO_[A-Z0-9_]+)\s*,\s*([^,]+)\s*,\s*(SPECIES_[A-Z0-9_]+)\s*\}/g,
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

  for (const mon of Object.values(pokemon)) {
    for (const evo of mon.evolutions) {
      if (pokemon[evo.targetSpecies]) {
        pokemon[evo.targetSpecies].preEvolutions.push(mon.key);
      }
    }
  }

  return pokemon;
}
