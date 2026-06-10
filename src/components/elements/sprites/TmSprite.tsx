type Props = {
  /** Raw type string — with or without "TYPE_" prefix, any case */
  type: string;
  size?: number;
};

function normalizeType(type: string): string {
  return type.replace(/^TYPE_/i, '').toLowerCase();
}

export default function TmSprite({ type, size = 32 }: Props) {
  if (!type) return null;
  const name = normalizeType(type);
  const src = new URL(`../../../assets/sprites/tms/tm-${name}.png`, import.meta.url).href;

  return (
    <img
      src={src}
      alt={`TM ${name}`}
      title={name.charAt(0).toUpperCase() + name.slice(1)}
      width={size}
      height={size}
      style={{ display: 'block', imageRendering: 'pixelated' }}
      onError={(e) => {
        // Fall back to the generic TM case sprite if type-specific one is missing
        (e.target as HTMLImageElement).src = new URL(
          '../../../assets/sprites/tms/tm-case.png',
          import.meta.url,
        ).href;
      }}
    />
  );
}
