// decomp-docs/src/components/elements/sprites/TrainerSprite.tsx
import { useState, useEffect } from 'react';
import { normalizeTrainerSpriteName } from './trainerSpriteUtils';

type Props = {
  name?: string;
  trainerClass?: string;
  sprite?: string;
  size?: number;
};

export default function TrainerSprite({ name, trainerClass, sprite, size = 64 }: Props) {
  // Pass all three properties to our new smarter utility
  const safeName = normalizeTrainerSpriteName(name, trainerClass, sprite);

  const sources = [
    `https://play.pokemonshowdown.com/sprites/trainers/${safeName}.png`,
    `https://play.pokemonshowdown.com/sprites/trainers/${safeName}-gen3.png`,
    `https://play.pokemonshowdown.com/sprites/trainers/${safeName}-gen4.png`,
    `https://play.pokemonshowdown.com/sprites/trainers/${safeName}-gen6.png`,
    'https://play.pokemonshowdown.com/sprites/trainers/red.png',
  ];

  const [index, setIndex] = useState(0);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setIndex(0);
  }, [safeName]);

  return (
    <img
      src={sources[index]}
      alt={name ?? trainerClass ?? 'Trainer'}
      width={size}
      height={size}
      loading="lazy"
      style={{ objectFit: 'contain' }}
      onError={() => {
        if (index < sources.length - 1) {
          setIndex((i) => i + 1);
        }
      }}
    />
  );
}
