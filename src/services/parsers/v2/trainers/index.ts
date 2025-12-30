/* eslint-disable @typescript-eslint/no-explicit-any */
import { getFile } from '../utils';
import { parseTrainersFile } from './trainers';
import { parseTrainerParties } from './parties';
import type { FileContent } from '../../../fileReader';
import type { ParsedAttack } from '../moves/types';
import type { ParsedItem } from '../items/types';
import type { ParsedPokemon } from '../pokemon/types';

export function parseTrainers(
  files: Map<string, FileContent>,
  moves: Record<string, ParsedAttack>,
  items: Record<string, ParsedItem>,
  pokemon: Record<string, ParsedPokemon>,
) {
  const trainersFile = getFile(files, 'src/data/trainers.h');
  const partiesFile = getFile(files, 'src/data/trainer_parties.h');
  const learnsetPtrs = getFile(files, 'src/data/pokemon/level_up_learnset_pointers.h');
  const learnsets = getFile(files, 'src/data/pokemon/level_up_learnsets.h');
  if (!trainersFile || !partiesFile || !learnsetPtrs || !learnsets) {
    console.warn('Missing trainer files');
    return {};
  }

  const trainers = parseTrainersFile(trainersFile, items);

  for (const trainer of Object.values(trainers)) {
    for (const variant of trainer.variants) {
      variant.party = parseTrainerParties(
        partiesFile,
        variant.partyKey,
        moves,
        items,
        pokemon,
        learnsetPtrs,
        learnsets,
      );
    }
  }

  return trainers;
}
