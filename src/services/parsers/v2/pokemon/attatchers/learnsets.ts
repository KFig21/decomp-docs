/* eslint-disable @typescript-eslint/no-explicit-any */
import type { levelUpLearnset, tmhmLearnset } from '../types';

export function attachLearnsets({
  pokemon,
  levelUpLearnsets,
  learnsetPointers,
  tmhmLearnsets,
}: {
  pokemon: Record<string, any>;
  levelUpLearnsets: Record<string, levelUpLearnset>;
  learnsetPointers: Record<string, string>;
  tmhmLearnsets: Record<string, tmhmLearnset>;
}) {
  for (const speciesKey of Object.keys(pokemon)) {
    const learnsetName = learnsetPointers[speciesKey];

    if (learnsetName && levelUpLearnsets[learnsetName]) {
      pokemon[speciesKey].levelUpLearnset = levelUpLearnsets[learnsetName];
    }

    if (tmhmLearnsets[speciesKey]) {
      pokemon[speciesKey].tmhmLearnset = tmhmLearnsets[speciesKey];
    }
  }
}
