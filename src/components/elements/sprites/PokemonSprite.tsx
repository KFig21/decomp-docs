import { useState, useEffect } from 'react';
import { getShowdownSlug } from '../../../utils/pokemon';

type Props = {
  name: string;
  speciesKey?: string;
  size?: number;
};

export default function PokemonSprite({ name, speciesKey, size = 64 }: Props) {
  const [imgError, setImgError] = useState(false);

  // 1. Start with the highly reliable base slug (e.g., "Pikachu" -> "pikachu", "Ho-Oh" -> "hooh")
  let slug = getShowdownSlug(name);

  if (speciesKey) {
    // e.g., "SPECIES_PIKACHU_ALOLA" -> "PIKACHU_ALOLA"
    const rawConstant = speciesKey.replace('SPECIES_', '');

    // Attempt to recreate the base constant to isolate the suffix
    // "Mr. Mime" -> "MR_MIME"
    const expectedBaseName = name
      .toUpperCase()
      .replace(/[^A-Z0-9]/g, '_')
      .replace(/_+/g, '_')
      .replace(/_$/, '');

    // If the constant has a suffix (e.g., PIKACHU_ALOLA starts with PIKACHU_)
    if (rawConstant.startsWith(`${expectedBaseName}_`)) {
      const suffix = rawConstant
        .replace(`${expectedBaseName}_`, '') // "ALOLA" or "STARTER_F"
        .toLowerCase()
        .replace(/_/g, '-'); // "alola" or "starter-f"

      // Final result: "pikachu-alola"
      slug = `${slug}-${suffix}`;
    }
  }

  // FIX: Reset the error state whenever the intended slug changes
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setImgError(false);
  }, [slug]);

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
