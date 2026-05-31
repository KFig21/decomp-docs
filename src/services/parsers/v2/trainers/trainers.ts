/* eslint-disable @typescript-eslint/no-explicit-any */
import type { ParsedTrainer, ParsedTrainerVariant, ParsedTrainerPokemon } from './types';

export function parseTrainersFile(
  file: string,
  items: Record<string, any>,
  moves: Record<string, any>,
  pokemon: Record<string, any>,
): Record<string, ParsedTrainer> {
  const trainers: Record<string, ParsedTrainer> = {};

  // Strip out any C-style block comments before parsing
  const cleanFile = file.replace(/\/\*[\s\S]*?\*\//g, '');

  // Split the file into chunks starting with the === TRAINER_ID === header
  const blocks = cleanFile.split(/^===\s*(TRAINER_[A-Z0-9_]+)\s*===/m).slice(1);

  for (let i = 0; i < blocks.length; i += 2) {
    const enumKey = blocks[i].trim();
    if (enumKey === 'TRAINER_NONE') continue;

    const blockContent = blocks[i + 1].trim();
    const lines = blockContent.split('\n').map((l) => l.trim());

    let currentSection = 'TRAINER';
    let rawName = enumKey.replace('TRAINER_', '');
    let trainerClassRaw = 'Pkmn Trainer';
    let trainerPicRaw = 'Hiker';
    let doubleBattle = false;

    const party: ParsedTrainerPokemon[] = [];
    let currentMon: any = null;

    for (let j = 0; j < lines.length; j++) {
      const line = lines[j];

      // Skip single line C-comments
      if (line.startsWith('//')) continue;

      // An empty line dictates a switch to the Pokémon section, or the next Pokémon
      if (!line) {
        if (currentSection === 'TRAINER') {
          currentSection = 'POKEMON';
        } else if (currentSection === 'POKEMON' && currentMon) {
          const finalized = finalizeMon(currentMon, pokemon);
          if (finalized) party.push(finalized);
          currentMon = null;
        }
        continue;
      }

      if (currentSection === 'TRAINER') {
        if (line.startsWith('Name:')) rawName = line.split(':')[1].trim();
        else if (line.startsWith('Class:')) trainerClassRaw = line.split(':')[1].trim();
        else if (line.startsWith('Pic:')) trainerPicRaw = line.split(':')[1].trim();
        else if (line.startsWith('Double Battle:'))
          doubleBattle = line.split(':')[1].trim().toLowerCase() === 'yes';
      } else {
        // POKEMON PARSING
        if (!currentMon) {
          currentMon = parseSpeciesLine(line, items);
        } else {
          if (line.startsWith('Level:')) {
            currentMon.level = parseInt(line.split(':')[1].trim());
          } else if (line.startsWith('IVs:')) {
            currentMon.iv = parseIVs(line);
          } else if (line.startsWith('- ')) {
            const moveStr = line.replace('- ', '').trim();
            const safeMove = moveStr
              .toUpperCase()
              .replace(/[^A-Z0-9]/g, '_')
              .replace(/_+/g, '_')
              .replace(/_$/, '');
            const moveKey = moveStr.startsWith('MOVE_') ? moveStr : `MOVE_${safeMove}`;
            if (moves[moveKey]) currentMon.moves.push(moves[moveKey]);
          }
        }
      }
    }

    // Catch the final Pokémon if the file ends without a trailing newline
    if (currentMon) {
      const finalized = finalizeMon(currentMon, pokemon);
      if (finalized) party.push(finalized);
    }

    // Format Trainer Name
    const name = rawName
      .toLowerCase()
      .replace(/_/g, ' ')
      .replace(/\b\w/g, (c) => c.toUpperCase());

    if (!trainers[name]) {
      trainers[name] = {
        baseKey: name,
        name,
        trainerClass: trainerClassRaw,
        trainerPic: trainerPicRaw,
        variants: [],
      };
    }

    const variant: ParsedTrainerVariant = {
      key: enumKey,
      name,
      trainerClass: trainerClassRaw,
      trainerPic: trainerPicRaw,
      items: [],
      doubleBattle,
      partyKey: '',
      partyType: 'NoItemCustomMoves',
      party,
      location: { locationKey: '', mapKey: '' },
    };

    // Attach trainer key reference back to the species
    for (const mon of party) {
      if (mon.species) {
        mon.species.trainers.push({ trainerKey: variant.key });
      }
    }

    trainers[name].variants.push(variant);
  }

  return trainers;
}

// --- HELPERS ---

function parseSpeciesLine(line: string, items: Record<string, any>) {
  const mon = { speciesKey: '', level: 100, iv: 31, heldItem: undefined, moves: [] as any[] };

  // Format: Nickname (Species) (M) @ Item OR Species (F) @ Item OR Species
  const parts = line.split('@');
  if (parts.length > 1) {
    const itemStr = parts[1].trim();
    // Sanitizes names like "King's Rock" -> "KINGS_ROCK"
    const safeItem = itemStr
      .toUpperCase()
      .replace(/[^A-Z0-9]/g, '_')
      .replace(/_+/g, '_')
      .replace(/_$/, '');
    const itemKey = itemStr.startsWith('ITEM_') ? itemStr : `ITEM_${safeItem}`;
    mon.heldItem = items[itemKey];
  }

  let speciesPart = parts[0].trim();
  // Strip gender markers (M) or (F)
  speciesPart = speciesPart.replace(/\s*\([MF]\)\s*$/, '').trim();

  // Strip nicknames if present to get the base species
  const nicknameMatch = speciesPart.match(/^(.*?)\s*\((.*?)\)$/);
  const speciesStr = nicknameMatch ? nicknameMatch[2].trim() : speciesPart;

  // Sanitizes names like "Ho-Oh" -> "HO_OH" or "Mime Jr." -> "MIME_JR"
  const safeSpecies = speciesStr
    .toUpperCase()
    .replace(/[^A-Z0-9]/g, '_')
    .replace(/_+/g, '_')
    .replace(/_$/, '');
  mon.speciesKey = speciesStr.startsWith('SPECIES_') ? speciesStr : `SPECIES_${safeSpecies}`;

  return mon;
}

function parseIVs(line: string) {
  // Grab the first numerical value as an approximation of IVs for the engine
  const match = line.match(/\d+/);
  return match ? parseInt(match[0], 10) : 31;
}

function finalizeMon(monDraft: any, pokemon: Record<string, any>): ParsedTrainerPokemon | null {
  const species = pokemon[monDraft.speciesKey];

  // SAFETY GUARD: If the lookup fails, drop the Pokémon gracefully instead of crashing the UI
  if (!species) {
    console.warn(
      `[Parser] Could not find species for key: "${monDraft.speciesKey}". Skipping this Pokémon.`,
    );
    return null;
  }

  // Assign Default Moves if none were explicitly written in the `.party` file
  if (monDraft.moves.length === 0 && species.levelUpLearnset) {
    const validMoves = species.levelUpLearnset
      .filter((m: any) => m.lvl <= monDraft.level)
      .map((m: any) => m.move);

    // The engine automatically assigns the 4 most recently learned moves
    monDraft.moves = validMoves.slice(-4);
  }

  return {
    species,
    level: monDraft.level,
    iv: monDraft.iv,
    heldItem: monDraft.heldItem,
    moves: monDraft.moves,
    nature: null,
  };
}
