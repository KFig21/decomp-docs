// decomp-docs/src/services/parsers/v2/trainers/index.ts

/* eslint-disable @typescript-eslint/no-explicit-any */
import { getFile } from '../utils';
import { parseTrainersFile } from './trainers';
import type { FileContent } from '../../../fileReader';
import type { ParsedAttack } from '../moves/types';
import type { ParsedItem } from '../items/types';
import type { ParsedPokemon } from '../pokemon/types';
import type { ParsedTrainer } from './types';

export function parseTrainers(
  files: Map<string, FileContent>,
  moves: Record<string, ParsedAttack>,
  items: Record<string, ParsedItem>,
  pokemon: Record<string, ParsedPokemon>,
) {
  // 1. Read the optional config file
  const configRaw = getFile(files, 'docs.config.json');
  const config = configRaw ? JSON.parse(configRaw) : null;

  // 2. Find all .party files dynamically
  let trainersFilePaths = Array.from(files.keys()).filter((path) => path.endsWith('.party'));

  // 3. Apply Config Allowlist / Blocklist if they exist
  if (config?.trainerFiles && Array.isArray(config.trainerFiles)) {
    trainersFilePaths = trainersFilePaths.filter((path) => config.trainerFiles.includes(path));
  } else if (config?.excludeTrainerFiles && Array.isArray(config.excludeTrainerFiles)) {
    trainersFilePaths = trainersFilePaths.filter(
      (path) => !config.excludeTrainerFiles.includes(path),
    );
  }

  if (trainersFilePaths.length === 0) {
    console.warn('Missing trainer files');
    return {};
  }

  const allTrainers: Record<string, ParsedTrainer> = {};

  // 4. Parse all valid files and merge them into the global pool
  for (const path of trainersFilePaths) {
    const fileContent = files.get(path);
    if (typeof fileContent !== 'string') continue;

    const parsed = parseTrainersFile(fileContent, items, moves, pokemon);

    for (const [name, trainerObj] of Object.entries(parsed)) {
      if (!allTrainers[name]) {
        allTrainers[name] = trainerObj;
      } else {
        allTrainers[name].variants.push(...trainerObj.variants);
      }
    }
  }

  return allTrainers;
}
