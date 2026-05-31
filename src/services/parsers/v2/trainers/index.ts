/* eslint-disable @typescript-eslint/no-explicit-any */
import { getFile } from '../utils';
import { parseTrainersFile } from './trainers';
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
  // Point this to trainers.party instead of trainers.h
  const trainersFile = getFile(files, 'src/data/trainers.party');

  if (!trainersFile) {
    console.warn('Missing trainer files');
    return {};
  }

  // We now pass moves and pokemon directly into the trainer parser
  return parseTrainersFile(trainersFile, items, moves, pokemon);
}
