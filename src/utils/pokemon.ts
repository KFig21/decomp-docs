/**
 * Converts a decomp species or item name into a valid Pokémon Showdown URL slug.
 * Showdown expects strictly lowercase, alphanumeric strings with no spaces, hyphens, or punctuation.
 */
export function getShowdownSlug(name: string): string {
  if (!name) return 'unknown';

  let slug = name.toLowerCase().trim();

  // 1. Convert gender symbols to 'm' and 'f' (Fixes Nidoran♂ and Nidoran♀)
  slug = slug.replace('♀', 'f').replace('♂', 'm');

  // 2. Strip ALL non-alphanumeric characters (spaces, hyphens, apostrophes, periods)
  // E.g., "Mr. Mime" -> "mrmime", "Ho-Oh" -> "hooh", "King's Rock" -> "kingsrock"
  slug = slug.replace(/[^a-z0-9]/g, '');

  return slug;
}
