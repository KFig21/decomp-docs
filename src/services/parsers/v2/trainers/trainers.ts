import type { ParsedTrainer, TrainerPartyType } from './types';
import { normalizeTrainerConstant } from './utils';

/* eslint-disable @typescript-eslint/no-explicit-any */
export function parseTrainersFile(
  file: string,
  items: Record<string, any>,
): Record<string, ParsedTrainer> {
  const trainers: Record<string, ParsedTrainer> = {};

  const headerRegex = /\[\s*(TRAINER_[A-Z0-9_]+)\s*\]\s*=\s*\{/g;
  const matches = [...file.matchAll(headerRegex)];

  for (let i = 0; i < matches.length; i++) {
    const key = matches[i][1];
    const start = matches[i].index! + matches[i][0].length;
    const end = i + 1 < matches.length ? matches[i + 1].index! : file.length;

    const body = file.slice(start, end);

    const name = body.match(/trainerName\s*=\s*_\("([^"]+)"\)/)?.[1] ?? key;

    const trainerClassRaw = body.match(/trainerClass\s*=\s*([A-Z0-9_]+)/)?.[1];

    const trainerPicRaw = body.match(/trainerPic\s*=\s*([A-Z0-9_]+)/)?.[1];

    const rawItems =
      body
        .match(/\.items\s*=\s*\{([\s\S]*?)\}/)?.[1]
        ?.split(',')
        .map((i) => i.trim())
        .filter((i) => i && i !== 'ITEM_NONE') ?? [];

    const trainerItems = rawItems.map((i) => items[i]).filter(Boolean);

    const doubleBattle = body.match(/doubleBattle\s*=\s*TRUE/) !== null;

    const partyMatch = body.match(/\.party\s*=\s*\{\.(\w+)\s*=\s*(sParty_[A-Za-z0-9_]+)\}/);

    trainers[key] = {
      key,
      name: name.toLowerCase().replace(/\b\w/g, (c) => c.toUpperCase()),
      trainerClass: normalizeTrainerConstant(trainerClassRaw ?? ''),
      trainerPic: normalizeTrainerConstant(trainerPicRaw ?? ''),
      items: trainerItems,
      doubleBattle,
      partyKey: partyMatch?.[2] ?? '',
      partyType: (partyMatch?.[1] as TrainerPartyType) ?? 'NoItemDefaultMoves',
      party: [],
    };
  }

  return trainers;
}
