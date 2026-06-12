import { useState, useEffect } from 'react';
import { getShowdownSlug } from '../../../../utils/pokemon';
import './PokemonSprite.scss';

type Props = {
  name: string;
  speciesKey?: string;
  /** Pixel size for the bounding box. Defaults to 64. */
  size?: number;
  shiny?: boolean;
};

export default function PokemonSprite({ name, speciesKey, size = 64, shiny = false }: Props) {
  const [imgError, setImgError] = useState(false);

  // 1. Start with the highly reliable base slug (e.g., "Pikachu" -> "pikachu", "Ho-Oh" -> "hooh")
  let slug = getShowdownSlug(name);

  if (speciesKey) {
    // e.g., "SPECIES_PIKACHU_ALOLA" -> "PIKACHU_ALOLA"
    const rawConstant = speciesKey.replace('SPECIES_', '');

    // Attempt to recreate the base constant to isolate the suffix
    // "Mr. Mime" -> "MR_MIME", "Nidoran♂" -> "NIDORANM" (gender symbols → letter first)
    const expectedBaseName = name
      .toUpperCase()
      .replace('♂', 'M')
      .replace('♀', 'F')
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

  // Reset the error state whenever the intended slug or shiny state changes
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setImgError(false);
  }, [slug, shiny]);

  const spriteUrl = `https://play.pokemonshowdown.com/sprites/${shiny ? 'dex-shiny' : 'dex'}/${slug}.png`;

  return (
    <div
      className="pokemon-sprite"
      style={{ '--pokemon-sprite-size': `${size}px` } as React.CSSProperties}
    >
      {!imgError ? (
        <img
          src={spriteUrl}
          alt={name}
          className="pokemon-sprite__img"
          onError={() => setImgError(true)}
        />
      ) : (
        <div className="pokemon-sprite__fallback">?</div>
      )}
    </div>
  );
}
