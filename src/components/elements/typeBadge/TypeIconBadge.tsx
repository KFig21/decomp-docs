import './typeIconBadge.scss';

type Props = {
  type: string;
  size?: number;
};

function normalizeType(type: string): string {
  return type.replace(/^TYPE_/i, '').toLowerCase();
}

export default function TypeIconBadge({ type, size = 20 }: Props) {
  if (!type) return null;
  const name = normalizeType(type);
  const src = new URL(`../../../assets/sprites/types/${name}-type-icon.png`, import.meta.url).href;

  return (
    <span
      className={`type-icon-badge type-icon-badge--${name}`}
      style={{ width: size, height: size }}
      title={name.charAt(0).toUpperCase() + name.slice(1)}
    >
      <img
        src={src}
        alt={name}
        width={Math.round(size * 0.7)}
        height={Math.round(size * 0.7)}
        style={{ imageRendering: 'pixelated' }}
      />
    </span>
  );
}
