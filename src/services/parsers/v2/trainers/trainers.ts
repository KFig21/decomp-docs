import type { ParsedTrainer, ParsedTrainerVariant, TrainerPartyType } from './types';
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
    const enumKey = matches[i][1];
    const start = matches[i].index! + matches[i][0].length;
    const end = i + 1 < matches.length ? matches[i + 1].index! : file.length;
    const body = file.slice(start, end);

    // CANONICAL ID
    const rawName =
      body.match(/trainerName\s*=\s*_\("([^"]+)"\)/)?.[1] ?? enumKey.replace('TRAINER_', '');

    const name = rawName
      .toLowerCase()
      .replace(/_/g, ' ')
      .replace(/\b\w/g, (c) => c.toUpperCase());

    const trainerClassRaw = body.match(/trainerClass\s*=\s*([A-Z0-9_]+)/)?.[1] ?? '';

    const trainerPicRaw = body.match(/trainerPic\s*=\s*([A-Z0-9_]+)/)?.[1] ?? '';

    const rawItems =
      body
        .match(/\.items\s*=\s*\{([\s\S]*?)\}/)?.[1]
        ?.split(',')
        .map((i) => i.trim())
        .filter((i) => i && i !== 'ITEM_NONE') ?? [];

    const trainerItems = rawItems.map((i) => items[i]).filter(Boolean);

    const doubleBattle = body.includes('doubleBattle = TRUE');

    const partyMatch = body.match(/\.party\s*=\s*\{\.(\w+)\s*=\s*(sParty_[A-Za-z0-9_]+)\}/);

    const partyType = (partyMatch?.[1] as TrainerPartyType) ?? 'NoItemDefaultMoves';
    const partyKey = partyMatch?.[2] ?? '';

    // GROUP BY TRAINER NAME
    if (!trainers[name]) {
      trainers[name] = {
        baseKey: name,
        name,
        trainerClass: normalizeTrainerConstant(trainerClassRaw),
        trainerPic: normalizeTrainerConstant(trainerPicRaw),
        variants: [],
      };
    }

    const variant: ParsedTrainerVariant = {
      key: enumKey,
      name,
      trainerClass: trainers[name].trainerClass,
      trainerPic: trainers[name].trainerPic,
      items: trainerItems,
      doubleBattle,
      partyKey,
      partyType,
      party: [],
    };

    trainers[name].variants.push(variant);
  }

  return trainers;
}
