import { useState } from 'react';
import { getShowdownSlug } from '../../../utils/pokemon';

type Props = {
  name: string;
  size?: number;
};

export default function PokemonSprite({ name, size = 64 }: Props) {
  const [imgError, setImgError] = useState(false);

  // Format the name using our new Showdown rule
  const slug = getShowdownSlug(name);

  // Hit the highly reliable Pokemon Showdown sprite repository
  const spriteUrl = `https://play.pokemonshowdown.com/sprites/dex/${slug}.png`;

  return (
    <div
      style={{
        width: size,
        height: size,
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
      }}
    >
      {!imgError ? (
        <img
          src={spriteUrl}
          alt={name}
          style={{ maxWidth: '100%', maxHeight: '100%', objectFit: 'contain' }}
          onError={() => setImgError(true)}
        />
      ) : (
        // Fallback rendering if the sprite is completely missing
        <div style={{ fontSize: '0.7rem', color: 'var(--fadedFont)', textAlign: 'center' }}>?</div>
      )}
    </div>
  );
}
