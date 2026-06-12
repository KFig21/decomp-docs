/* eslint-disable react-refresh/only-export-components */
import './styles.scss';

// ── Labels ────────────────────────────────────────────────────────────────────

export const POCKET_DISPLAY_LABELS: Record<string, string> = {
  items:      'Items',
  balls:      'Balls',
  tms:        'TMs & HMs',
  berries:    'Berries',
  'key-items':'Key Items',
};

// ── SVG Icons ─────────────────────────────────────────────────────────────────

/** Jar / HP-Up bottle silhouette */
function JarIcon({ size = 16 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
      <rect x="8" y="2" width="8" height="2" rx="1" />
      <rect x="9" y="4" width="6" height="2" />
      <path d="M6 8 Q5 6 6 6 H18 Q19 6 18 8 L18 19 Q18 22 15 22 H9 Q6 22 6 19 Z" />
      <rect x="7" y="13" width="10" height="1.5" fill="white" opacity="0.35" />
    </svg>
  );
}

/** Pokéball silhouette */
function BallIcon({ size = 16 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
      <path
        fillRule="evenodd"
        d="M12 2 A10 10 0 1 1 12 22 A10 10 0 1 1 12 2 Z M2 11 L22 11 L22 13 L2 13 Z M12 9 A3 3 0 1 1 12 15 A3 3 0 1 1 12 9 Z"
      />
    </svg>
  );
}

/** Disc / TM silhouette — ring */
function DiscIcon({ size = 16 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
      <path
        fillRule="evenodd"
        d="M12 2 A10 10 0 1 1 12 22 A10 10 0 1 1 12 2 Z M12 8 A4 4 0 1 1 12 16 A4 4 0 1 1 12 8 Z"
      />
    </svg>
  );
}

/** Berry (Leppa-style) */
function BerryIcon({ size = 16 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
      <path d="M12 7 Q12 4 14 2 Q16 3 14 6 Q13 7 12 7 Z" />
      <circle cx="12" cy="14" r="8" />
      <circle cx="9.5" cy="11" r="1.5" fill="white" opacity="0.3" />
    </svg>
  );
}

/** Star — key items */
function StarIcon({ size = 16 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
      <polygon points="12,2 14.9,9.8 23,9.8 16.5,14.5 19,22 12,17 5,22 7.5,14.5 1,9.8 9.1,9.8" />
    </svg>
  );
}

// ── Icon selector ─────────────────────────────────────────────────────────────

export function PocketIcon({ pocket, size = 16 }: { pocket: string; size?: number }) {
  switch (pocket) {
    case 'items':     return <JarIcon size={size} />;
    case 'balls':     return <BallIcon size={size} />;
    case 'tms':       return <DiscIcon size={size} />;
    case 'berries':   return <BerryIcon size={size} />;
    case 'key-items': return <StarIcon size={size} />;
    default:          return null;
  }
}

// ── Circle — filled circle + white icon, colored via CSS class ────────────────

export function PocketCircle({ pocket, size = 20 }: { pocket: string; size?: number }) {
  if (!POCKET_DISPLAY_LABELS[pocket]) return null;
  const iconSize = Math.round(size * 0.55);
  return (
    <span
      className={`pocket-circle pocket-circle--${pocket}`}
      style={{ width: size, height: size }}
    >
      <PocketIcon pocket={pocket} size={iconSize} />
    </span>
  );
}

// ── Badge pill — circle + label, colored via CSS class ────────────────────────

interface Props {
  pocket: string;
  showLabel?: boolean;
}

export default function ItemPocketBadge({ pocket, showLabel = true }: Props) {
  const label = POCKET_DISPLAY_LABELS[pocket];
  if (!label) return null;

  return (
    <span className={`item-pocket-badge item-pocket-badge--${pocket}`}>
      <PocketCircle pocket={pocket} size={16} />
      {showLabel && <span className="item-pocket-badge__label">{label}</span>}
    </span>
  );
}
