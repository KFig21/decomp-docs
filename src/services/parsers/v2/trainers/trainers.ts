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
    const lines = blockContent.split('\n');

    let currentSection = 'TRAINER';
    let rawName = enumKey.replace('TRAINER_', '');
    let trainerClassRaw = 'Pkmn Trainer';
    let trainerPicRaw = 'Hiker';
    let doubleBattle = false;

    const party: ParsedTrainerPokemon[] = [];
    let currentMon: any = null;

    for (let j = 0; j < lines.length; j++) {
      // Strip inline comments and trim whitespace
      const line = lines[j].split('//')[0].trim();

      // An empty line dictates a switch to the next Pokémon
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
        // Trainer attributes always have a colon.
        if (line.includes(':')) {
          if (line.startsWith('Name:')) rawName = line.split(':')[1].trim();
          else if (line.startsWith('Class:')) trainerClassRaw = line.split(':')[1].trim();
          else if (line.startsWith('Pic:')) trainerPicRaw = line.split(':')[1].trim();
          else if (line.startsWith('Double Battle:'))
            doubleBattle = line.split(':')[1].trim().toLowerCase() === 'yes';
        } else {
          // If we hit text without a colon, it's a Pokemon (The decomp forgot the blank line!)
          currentSection = 'POKEMON';
          currentMon = parseSpeciesLine(line, items);
        }
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

    // Catch the final Pokémon if the file ends abruptly
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
      isPlaced: false,
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

  const parts = line.split('@');
  if (parts.length > 1) {
    const itemStr = parts[1].trim();
    const safeItem = itemStr
      .toUpperCase()
      .replace(/[^A-Z0-9]/g, '_')
      .replace(/_+/g, '_')
      .replace(/_$/, '');
    const itemKey = itemStr.startsWith('ITEM_') ? itemStr : `ITEM_${safeItem}`;
    mon.heldItem = items[itemKey];
  }

  let speciesPart = parts[0].trim();
  speciesPart = speciesPart.replace(/\s*\([MF]\)\s*$/, '').trim();

  const nicknameMatch = speciesPart.match(/^(.*?)\s*\((.*?)\)$/);
  const speciesStr = nicknameMatch ? nicknameMatch[2].trim() : speciesPart;

  const safeSpecies = speciesStr
    .toUpperCase()
    .replace(/[^A-Z0-9]/g, '_')
    .replace(/_+/g, '_')
    .replace(/_$/, '');
  mon.speciesKey = speciesStr.startsWith('SPECIES_') ? speciesStr : `SPECIES_${safeSpecies}`;

  return mon;
}

function parseIVs(line: string) {
  const match = line.match(/\d+/);
  return match ? parseInt(match[0], 10) : 31;
}

function finalizeMon(monDraft: any, pokemon: Record<string, any>): ParsedTrainerPokemon | null {
  let species = pokemon[monDraft.speciesKey];

  // Provide fallbacks if the parsed species key doesn't exactly match the decomp constants
  if (!species) {
    species = pokemon[`${monDraft.speciesKey}_NORMAL`];
  }

  if (!species && monDraft.speciesKey.endsWith('_NORMAL')) {
    species = pokemon[monDraft.speciesKey.replace('_NORMAL', '')];
  }

  if (!species) {
    console.warn(
      `[Parser] Could not find species for key: "${monDraft.speciesKey}". Skipping this Pokémon.`,
    );
    return null;
  }

  if (monDraft.moves.length === 0 && species.levelUpLearnset) {
    const validMoves = species.levelUpLearnset
      .filter((m: any) => m.lvl <= monDraft.level)
      .map((m: any) => m.move);

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
