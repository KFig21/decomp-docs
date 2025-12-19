/* eslint-disable @typescript-eslint/no-explicit-any */
import { getFile } from '../utils';
import { parseTrainersFile } from './trainers';
import { parseTrainerParties } from './parties';

export function parseTrainers(
  files: Map<string, string>,
  moves: Record<string, any>,
  items: Record<string, any>,
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
    trainer.party = parseTrainerParties(
      partiesFile,
      trainer.partyKey,
      moves,
      items,
      learnsetPtrs,
      learnsets,
    );
  }

  return trainers;
}
