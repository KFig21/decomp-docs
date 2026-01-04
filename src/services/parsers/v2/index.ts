/* eslint-disable @typescript-eslint/no-explicit-any */

import type { FileContent } from '../../fileReader';
import { parseAbilities } from './abilities';
import { parseItems } from './items';
import { attachItemLocations } from './items/attachItemLocations';
import { parseLocations } from './locations';
import { parseMoves } from './moves/moves';
import { parseNatures } from './natures';
import { parsePokemon } from './pokemon';
import { parseTrainers } from './trainers';

export async function parseDecompV2(
  files: Map<string, FileContent>,
  renderMaps: boolean,
): Promise<any> {
  // Parse variables that do not depend on others first
  const moves = parseMoves({ files });
  const items = parseItems({ files });
  const abilities = parseAbilities({ files });
  const natures = parseNatures({ files });

  // Then parse Pokémon, which depends on moves, items, and abilities
  const pokemon = parsePokemon(files, items, moves, abilities);

  // Then parse trainers, which depends on moves
  const trainers = parseTrainers(files, moves, items, pokemon);

  // Finally, parse locations, which may depend on trainers, moves, and items
  const locations = await parseLocations(files, items, trainers, pokemon, renderMaps);

  // All data parsed, now attach references
  attachItemLocations(items, locations);

  console.log('Parsed moves:', moves);
  console.log('Parsed items:', items);
  console.log('Parsed abilities:', abilities);
  console.log('Parsed natures:', natures);
  console.log('Parsed Pokémon:', pokemon);
  console.log('Parsed trainers:', trainers);
  console.log('Parsed locations:', locations);

  return {
    moves,
    items,
    abilities,
    pokemon,
    trainers,
    locations,
  };
}
