import { useState } from 'react';
import { normalizeTrainerSpriteName } from './trainerSpriteUtils';

type Props = {
  trainerClass?: string;
  sprite?: string;
  size?: number;
};

export default function TrainerSprite({ trainerClass, sprite, size = 64 }: Props) {
  const safeName = normalizeTrainerSpriteName(sprite ?? trainerClass);

  const sources = [
    `https://play.pokemonshowdown.com/sprites/trainers/${safeName}.png`,
    `https://play.pokemonshowdown.com/sprites/trainers/${safeName}-gen3.png`,
    `https://play.pokemonshowdown.com/sprites/trainers/${safeName}-gen4.png`,
    `https://play.pokemonshowdown.com/sprites/trainers/${safeName}-gen6.png`,
    'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/0.png',
  ];

  const [index, setIndex] = useState(0);

  return (
    <img
      src={sources[index]}
      alt={trainerClass ?? 'Trainer'}
      width={size}
      height={size}
      loading="lazy"
      onError={() => {
        if (index < sources.length - 1) {
          setIndex((i) => i + 1);
        }
      }}
    />
  );
}
