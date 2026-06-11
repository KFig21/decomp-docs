/* eslint-disable @typescript-eslint/no-explicit-any */
import type { FileContent } from '../../fileReader';
import { parseAbilities } from './abilities';
import { parseItems } from './items';
import { attachItemLocations } from './items/attachItemLocations';
import { markEvolutionItems } from './items/markEvolutionItems';
import { parseLocations } from './locations';
import { parseWeathers } from './weather';
import { parseMoves } from './moves/moves';
import { parseNatures } from './natures';
import { markItemsPlaced, markPokemonObtainable } from './obtainability';
import { parsePokemon } from './pokemon';
import { parseTypeChart } from './typeChart';
import { attachWildHeldItems } from './pokemon/attatchers/heldItems';
import { parseTrainers } from './trainers';

const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

export async function parseDecompV2(
  files: Map<string, FileContent>,
  renderMaps: boolean,
  onProgress?: (text: string, percent: number) => void,
  checkCancel?: () => boolean,
): Promise<any> {
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

  if (onProgress) onProgress('Parsing type chart...', m.moves - 1);
  await delay(100);
  if (checkCancel?.()) throw new Error('CANCELLED');
  const typeChart = parseTypeChart({ files });

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

  if (onProgress) onProgress('Parsing Pokémon...', m.pokemon);
  await delay(500);
  if (checkCancel?.()) throw new Error('CANCELLED');
  const pokemon = parsePokemon(files, items, moves, abilities);

  if (onProgress) onProgress('Parsing trainers...', m.trainers);
  await delay(500);
  if (checkCancel?.()) throw new Error('CANCELLED');
  const trainers = parseTrainers(files, moves, items, pokemon);

  if (onProgress) onProgress('Parsing weather...', m.locStart - 1);
  await delay(0);
  if (checkCancel?.()) throw new Error('CANCELLED');
  const weathers = parseWeathers(files);

  if (onProgress) onProgress('Parsing locations...', m.locStart);
  await delay(500);
  if (checkCancel?.()) throw new Error('CANCELLED');

  // ── Destructure the new return shape ──────────────────────────────────────
  const { locations, scriptsByMap } = await parseLocations(
    files,
    items,
    trainers,
    pokemon,
    weathers,
    renderMaps,
    onProgress,
    m.locStart,
    m.locEnd,
    checkCancel,
  );

  // ── Mark evolution items ──────────────────────────────────────────────────
  markEvolutionItems(items, pokemon);

  // ── Attach item locations (overworld, hidden, mart, npc) ──────────────────
  if (onProgress) onProgress('Attaching item locations...', m.attach);
  await delay(500);
  if (checkCancel?.()) throw new Error('CANCELLED');
  attachItemLocations(items, locations, scriptsByMap);

  // ── Attach wild held items (.itemCommon / .itemRare / .itemUncommon) ──────
  if (onProgress) onProgress('Attaching wild held items...', m.attach + 1);
  await delay(100);

  const speciesInfoContent = Array.from(files.entries())
    .filter(([path]) => path.includes('src/data/pokemon/species_info'))
    .map(([, content]) => (typeof content === 'string' ? content : ''))
    .join('\n');
  attachWildHeldItems(pokemon, items, speciesInfoContent);

  // ── Obtainability ─────────────────────────────────────────────────────────
  if (onProgress) onProgress('Determining Pokémon obtainability...', m.attach + 2);
  await delay(100);
  markPokemonObtainable(pokemon, trainers);

  // ── Pass `locations` so markItemsPlaced can whitelist by valid roots ──
  markItemsPlaced(items, pokemon, trainers, files, locations);

  if (onProgress) onProgress('Complete!', m.complete);
  await delay(500);

  console.log('Parsed type chart:', typeChart);
  console.log('Parsed moves:', moves);
  console.log('Parsed items:', items);
  console.log('Parsed abilities:', abilities);
  console.log('Parsed natures:', natures);
  console.log('Parsed Pokémon:', pokemon);
  console.log('Parsed trainers:', trainers);
  console.log('Parsed weathers:', weathers);
  console.log('Parsed locations:', locations);

  // ── Return ALL parsed data including abilities and natures ────────────────
  return { typeChart, moves, items, abilities, natures, pokemon, trainers, weathers, locations };
}
