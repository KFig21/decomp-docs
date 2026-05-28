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

const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

export async function parseDecompV2(
  files: Map<string, FileContent>,
  renderMaps: boolean,
  onProgress?: (text: string, percent: number) => void,
  checkCancel?: () => boolean,
): Promise<any> {
  // DYNAMIC MILESTONES: Compress the standard parsing steps to the first 7%
  // if we know locations map rendering is going to take several minutes.
  const m = renderMaps
    ? {
        moves: 1,
        items: 2,
        abilities: 3,
        natures: 4,
        pokemon: 5,
        trainers: 6,
        locStart: 7,
        locEnd: 98,
        attach: 99,
        complete: 100,
      }
    : {
        moves: 10,
        items: 20,
        abilities: 30,
        natures: 40,
        pokemon: 50,
        trainers: 60,
        locStart: 70,
        locEnd: 95,
        attach: 98,
        complete: 100,
      };

  // Parse variables that do not depend on others first (moves, items, abilities, natures)
  if (onProgress) onProgress('Parsing moves...', m.moves);
  await delay(500);
  if (checkCancel?.()) throw new Error('CANCELLED');
  const moves = parseMoves({ files });

  if (onProgress) onProgress('Parsing items...', m.items);
  await delay(500);
  if (checkCancel?.()) throw new Error('CANCELLED');
  const items = parseItems({ files });

  if (onProgress) onProgress('Parsing abilities...', m.abilities);
  await delay(500);
  if (checkCancel?.()) throw new Error('CANCELLED');
  const abilities = parseAbilities({ files });

  if (onProgress) onProgress('Parsing natures...', m.natures);
  await delay(500);
  if (checkCancel?.()) throw new Error('CANCELLED');
  const natures = parseNatures({ files });

  // Then parse Pokémon, which depends on moves, items, and abilities
  if (onProgress) onProgress('Parsing Pokémon...', m.pokemon);
  await delay(500);
  if (checkCancel?.()) throw new Error('CANCELLED');
  const pokemon = parsePokemon(files, items, moves, abilities);

  // Then parse trainers, which depends on moves
  if (onProgress) onProgress('Parsing trainers...', m.trainers);
  await delay(500);
  if (checkCancel?.()) throw new Error('CANCELLED');
  const trainers = parseTrainers(files, moves, items, pokemon);

  // Finally, parse locations, which may depend on trainers, moves, and items
  if (onProgress) onProgress('Parsing locations...', m.locStart);
  await delay(500);
  if (checkCancel?.()) throw new Error('CANCELLED');

  // Pass the dynamic start and end percentages into the location parser
  const locations = await parseLocations(
    files,
    items,
    trainers,
    pokemon,
    renderMaps,
    onProgress,
    m.locStart,
    m.locEnd,
    checkCancel,
  );

  // All data parsed, now attach references
  if (onProgress) onProgress('Attaching item locations...', m.attach);
  await delay(500);
  if (checkCancel?.()) throw new Error('CANCELLED');
  attachItemLocations(items, locations);

  if (onProgress) onProgress('Complete!', m.complete);
  await delay(500);

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
