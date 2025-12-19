/* eslint-disable @typescript-eslint/no-explicit-any */

import { parseSpeciesConstants } from './parsers/speciesContants';
import { attachSpeciesNames } from './attatchers/speciesName';
import { attachBaseStats } from './attatchers/baseStats';

import { parseLevelUpLearnsets, parseLearnsetPointers } from './parsers/levelUpLearnsets';
import { parseTMHMLearnsets } from './parsers/tmhmLearnsets';
import { attachLearnsets } from './attatchers/learnsets';

import { attachAbilities } from './attatchers/abilites';
import { getFile } from '../utils';

export function parsePokemon(
  files: Map<string, string>,
  items: Record<string, any>,
  moves: Record<string, any>,
  abilities: Record<string, any>,
): Record<string, any> {
  const filePaths = {
    baseStats: 'src/data/pokemon/base_stats.h',
    levelUpLearnsets: 'src/data/pokemon/level_up_learnsets.h',
    learnsetPointers: 'src/data/pokemon/level_up_learnset_pointers.h',
    pokemonSpeciesConstants: 'include/constants/species.h',
    pokemonSpeciesNames: 'src/data/text/species_names.h',
    tmhmLearnsets: 'src/data/pokemon/tmhm_learnsets.h',
  };

  // Create base Pokémon entries
  const pokemonSpeciesFile = getFile(files, filePaths.pokemonSpeciesConstants)!;
  const pokemon = parseSpeciesConstants(pokemonSpeciesFile);

  // Attach species names
  const pokemonNamesFile = getFile(files, filePaths.pokemonSpeciesNames)!;
  attachSpeciesNames(pokemon, pokemonNamesFile);

  // Attach base stats
  const baseStatsFile = getFile(files, filePaths.baseStats)!;
  attachBaseStats(pokemon, baseStatsFile);

  // Parse level up learnsets & pointers
  const levelUpLearnsetsFile = getFile(files, filePaths.levelUpLearnsets)!;
  const levelUpLearnsets = parseLevelUpLearnsets(moves, levelUpLearnsetsFile);

  const learnsetPointersFile = getFile(files, filePaths.learnsetPointers)!;
  const learnsetPointers = parseLearnsetPointers(learnsetPointersFile);

  // Parse TMHM learnsets
  const tmhmLearnsetsFile = getFile(files, filePaths.tmhmLearnsets)!;
  const tmhmLearnsets = parseTMHMLearnsets(tmhmLearnsetsFile, items, moves);

  attachLearnsets({
    pokemon,
    levelUpLearnsets,
    learnsetPointers,
    tmhmLearnsets,
  });

  attachAbilities(pokemon, baseStatsFile, abilities);

  return pokemon;
}
