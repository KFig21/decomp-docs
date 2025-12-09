/* eslint-disable @typescript-eslint/no-explicit-any */
import type { Location, WildPokemon } from '../../types/decomp';
import { getFile } from './utils';

export function parseWildPokemon({
  location,
  mapConst,
  files,
}: {
  location: Location;
  mapConst: string;
  files: Map<string, string>;
}) {
  const wildEncounterFile = getFile(files, 'src/data/wild_encounters.json');
  const speciesFile = getFile(files, 'src/data/text/species_names.h');

  if (!wildEncounterFile) return;

  const wildData = JSON.parse(wildEncounterFile);

  const match = wildData.wild_encounter_groups?.[0]?.encounters?.find(
    (e: any) => e.map === mapConst,
  );

  if (!match?.land_mons) return;

  const rates = [20, 20, 10, 10, 10, 10, 5, 5, 4, 4, 1, 1];

  match.land_mons.mons.forEach((m: any, i: number) => {
    const entry: WildPokemon = {
      species: getSpeciesName(m.species, speciesFile),
      level: `${m.min_level}-${m.max_level}` as any,
      rate: rates[i],
    };

    location.wildPokemon.push(entry);
  });
}

function getSpeciesName(speciesId: string, speciesFile: string | null) {
  if (!speciesFile) return speciesId;
  const match = speciesFile.match(new RegExp(`\\[${speciesId}\\]\\s*=\\s*_\\("([^"]+)"\\)`));
  return match?.[1] || speciesId;
}
