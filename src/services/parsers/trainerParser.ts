/* eslint-disable @typescript-eslint/no-explicit-any */
import type { Location, Trainer, TrainerPokemon } from '../../types/decomp';
import { getFile } from './utils';

type Args = {
  location: Location;
  parsedMap: any;
  scriptsInc: string | null;
  files: Map<string, string>;
};

export function parseTrainers({ location, parsedMap, scriptsInc, files }: Args) {
  const trainerFile = getFile(files, 'src/data/trainers.h');
  const trainerPartiesFile = getFile(files, 'src/data/trainer_parties.h');
  const speciesFile = getFile(files, 'src/data/text/species_names.h');
  const learnsetPointersFile = getFile(files, 'src/data/pokemon/level_up_learnset_pointers.h');
  const learnsetsFile = getFile(files, 'src/data/pokemon/level_up_learnsets.h');

  const objectEvents = parsedMap.object_events ?? [];

  for (const obj of objectEvents) {
    if (obj.trainer_type !== 'TRAINER_TYPE_NORMAL') continue;
    if (!scriptsInc || !trainerFile || !trainerPartiesFile) continue;

    const scriptName = obj.script;

    const trainerMatch = scriptsInc.match(
      new RegExp(`${scriptName}::[\\s\\S]*?trainerbattle_single\\s+(TRAINER_[A-Z0-9_]+)`),
    );
    if (!trainerMatch) continue;

    const trainerId = trainerMatch[1];

    const trainerBlockMatch = trainerFile.match(
      new RegExp(
        `\\[${trainerId}\\]\\s*=\\s*\\{([\\s\\S]*?\\.party\\s*=\\s*\\{[^}]*?(sParty_[A-Za-z0-9_]+)[^}]*?\\}[\\s\\S]*?)\\},`,
        'm',
      ),
    );
    if (!trainerBlockMatch) continue;

    const trainerBlock = trainerBlockMatch[1];

    // Extract trainerName
    const trainerNameMatch = trainerBlock.match(/trainerName\s*=\s*_\("([^"]+)"\)/);
    const rawName = trainerNameMatch?.[1] || trainerId;

    // Convert "CALVIN" → "Calvin"
    const trainerName = rawName
      .toLowerCase()
      .split(' ')
      .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
      .join(' ');

    // Extract trainerClass
    const trainerClassMatch = trainerBlock.match(/trainerClass\s*=\s*([A-Z0-9_]+)/);
    const trainerClassRaw = trainerClassMatch?.[1] || 'UNKNOWN';
    const trainerClass = normalizeTrainerConstant(trainerClassRaw);

    // Extract trainerPic
    const trainerPicMatch = trainerBlock.match(/trainerPic\s*=\s*([A-Z0-9_]+)/);
    const trainerPicRaw = trainerPicMatch?.[1] || 'UNKNOWN';
    const trainerPic = normalizeTrainerConstant(trainerPicRaw);

    // Extract items
    const itemsMatch = trainerBlock.match(/items\s*=\s*\{([^}]*)\}/);
    const items = itemsMatch
      ? itemsMatch[1]
          .split(',')
          .map((i) => i.trim())
          .filter((i) => i && i !== 'ITEM_NONE')
      : [];

    // Determine party key (NoItemDefaultMoves / ItemCustomMoves / etc)
    const partyMatch = trainerBlock.match(/\.party\s*=\s*\{\.(\w+)\s*=\s*(\w+)\}/);
    const partyName = partyMatch?.[2];

    const trainer: Trainer = {
      name: trainerName,
      class: trainerClass,
      sprite: trainerPic,
      items,
      party: [],
    };

    if (partyName) {
      parsePartyPokemon({
        trainer,
        partyName,
        trainerPartiesFile,
        speciesFile,
        learnsetPointersFile,
        learnsetsFile,
      });
    }

    location.trainers.push(trainer);
  }
}

function parsePartyPokemon({
  trainer,
  partyName,
  trainerPartiesFile,
  speciesFile,
  learnsetPointersFile,
  learnsetsFile,
}: any) {
  if (!trainerPartiesFile) return;

  const partyRegex = new RegExp(
    `(?:static\\s+const\\s+struct\\s+[A-Za-z0-9_]+\\s+)?${partyName}\\s*\\[\\s*\\]\\s*=\\s*\\{([\\s\\S]*?)\\n\\};`,
    'm',
  );

  const partyBlockMatch = trainerPartiesFile.match(partyRegex);
  if (!partyBlockMatch) return;

  const partyInner = partyBlockMatch[1];

  const monRegex = /\{\s*[^}]*?\.lvl\s*=\s*\d+[^}]*?\}/g;
  const mons = Array.from(partyInner.matchAll(monRegex)).map((m: any) => m[0]);

  for (const monBlock of mons) {
    const lvl = monBlock.match(/\.lvl\s*=\s*(\d+)/)?.[1];
    const species = monBlock.match(/\.species\s*=\s*(SPECIES_[A-Z0-9_]+)/)?.[1];

    if (!lvl || !species) continue;

    const mon: TrainerPokemon = {
      name: getSpeciesName(species, speciesFile),
      level: Number(lvl),
      moves: getDefaultMoves(species, Number(lvl), learnsetPointersFile, learnsetsFile),
    };

    trainer.party.push(mon);
  }
}

function getSpeciesName(speciesId: string, speciesFile: string | null) {
  if (!speciesFile) return speciesId;
  const match = speciesFile.match(new RegExp(`\\[${speciesId}\\]\\s*=\\s*_\\("([^"]+)"\\)`));
  return match?.[1] || speciesId;
}

function getDefaultMoves(
  speciesId: string,
  level: number,
  ptrFile: string | null,
  learnsetsFile: string | null,
): string[] {
  if (!ptrFile || !learnsetsFile) return [];

  const ptrMatch = ptrFile.match(new RegExp(`\\[${speciesId}\\]\\s*=\\s*(s[A-Za-z0-9_]+)`));
  if (!ptrMatch) return [];

  const learnsetMatch = learnsetsFile.match(
    new RegExp(`static const struct LevelUpMove ${ptrMatch[1]}\\[\\][\\s\\S]*?LEVEL_UP_END`),
  );
  if (!learnsetMatch) return [];

  return Array.from(learnsetMatch[0].matchAll(/LEVEL_UP_MOVE\(\s*(\d+),\s*(MOVE_[A-Z0-9_]+)\s*\)/g))
    .filter((m) => Number(m[1]) <= level)
    .slice(-4)
    .map((m) => normalizeMoveName(m[2]));
}

function normalizeTrainerConstant(constant: string) {
  if (!constant) return 'Unknown';

  // Remove prefix if present
  const name = constant.replace(/^TRAINER_CLASS_|^TRAINER_PIC_/, '');

  // Replace underscores with spaces, lowercase, then capitalize first letter
  return name
    .toLowerCase()
    .split('_')
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(' ');
}

function normalizeMoveName(move: string) {
  if (!move) return '';

  return move
    .replace(/^MOVE_/, '') // remove prefix
    .toLowerCase()
    .split('_') // split words
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(' ');
}
