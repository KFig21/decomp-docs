export function formatReadableName(input: string): string {
  if (!input) return '';

  return (
    input
      // Replace underscores with spaces
      .replace(/_/g, ' ')
      // Insert space between camelCase / PascalCase words
      .replace(/([a-z])([A-Z])/g, '$1 $2')
      // Normalize spacing
      .toLowerCase()
      .split(' ')
      .filter(Boolean)
      // Capitalize words (keep short connector words lowercase if desired)
      .map((word) =>
        ['of', 'the', 'and', 'in'].includes(word)
          ? word
          : word.charAt(0).toUpperCase() + word.slice(1),
      )
      .join(' ')
  );
}

export function formatType(input: string): string {
  if (!input) return '';

  return input
    .replace(/^TYPE_/, '') // remove TYPE_ prefix
    .toLowerCase() // fire
    .replace(/^\w/, (c) => c.toUpperCase()); // Fire
}
