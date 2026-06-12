/* eslint-disable react-refresh/only-export-components */
import '../itemPocketIcon/styles.scss';

// ── Method metadata ───────────────────────────────────────────────────────────

export const METHOD_COLORS: Record<string, string> = {
  overworld:  '#3baf6a',
  hidden:     '#8a63d2',
  mart:       '#d4862f',
  npc:        '#3a9bd4',
  berry_tree: '#d43a6e',
};

export const METHOD_LABELS: Record<string, string> = {
  overworld:  'Overworld',
  hidden:     'Hidden',
  mart:       'Mart',
  npc:        'NPC Gift',
  berry_tree: 'Berry Tree',
};

// ── SVG Icons ─────────────────────────────────────────────────────────────────

/** Rock silhouette — overworld */
function RockIcon({ size = 16 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
      {/* Organic rock shape */}
      <path d="M5 17 Q3 13 5 9 Q8 4 13 5 Q18 4 21 9 Q23 13 20 17 Q17 21 12 21 Q7 21 5 17 Z" />
      {/* Highlight crack detail */}
      <path d="M10 9 L9 13 L11 12 L10 16" stroke="white" strokeWidth="1" strokeLinecap="round" fill="none" opacity="0.3" />
    </svg>
  );
}

/** Magnifying glass — hidden */
function MagnifyingGlassIcon({ size = 16 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
      {/* Lens ring (outer circle minus inner) */}
      <path
        fillRule="evenodd"
        d="
          M10 2 A8 8 0 1 1 10 18 A8 8 0 1 1 10 2 Z
          M10 5.5 A4.5 4.5 0 1 1 10 14.5 A4.5 4.5 0 1 1 10 5.5 Z
        "
      />
      {/* Handle */}
      <path d="M14.5 15 L20.5 21 Q21.5 22 20.5 23 Q19.5 24 18.5 23 L12.5 17 Z" />
    </svg>
  );
}

/** Dollar sign — mart */
function DollarIcon({ size = 16 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
      {/* Coin circle */}
      <circle cx="12" cy="12" r="10" />
      {/* White $ sign */}
      <text
        x="12"
        y="17"
        textAnchor="middle"
        fontSize="14"
        fontWeight="900"
        fontFamily="sans-serif"
        fill="white"
      >
        $
      </text>
    </svg>
  );
}

/** Gift box — NPC gift */
function GiftIcon({ size = 16 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
      {/* Box body */}
      <rect x="3" y="12" width="18" height="10" rx="1.5" />
      {/* Lid */}
      <rect x="2" y="8" width="20" height="5" rx="1.5" />
      {/* Ribbon — vertical */}
      <rect x="10.5" y="8" width="3" height="14" fill="white" opacity="0.35" />
      {/* Ribbon — horizontal on lid */}
      <rect x="2" y="11" width="20" height="2" fill="white" opacity="0.35" />
      {/* Bow — left loop */}
      <path d="M12 8 C10 5 6 4 7 8 Z" fill="white" opacity="0.45" />
      {/* Bow — right loop */}
      <path d="M12 8 C14 5 18 4 17 8 Z" fill="white" opacity="0.45" />
    </svg>
  );
}

/** Pine tree — berry tree */
function TreeIcon({ size = 16 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
      {/* Trunk */}
      <rect x="10" y="19" width="4" height="4" rx="0.5" />
      {/* Upper triangle */}
      <polygon points="12,2 21,15 3,15" />
      {/* Lower triangle (overlaps, creates layered look) */}
      <polygon points="12,9 22,21 2,21" />
    </svg>
  );
}

// ── Icon selector ─────────────────────────────────────────────────────────────

export function MethodIcon({ method, size = 16 }: { method: string; size?: number }) {
  switch (method) {
    case 'overworld':  return <RockIcon size={size} />;
    case 'hidden':     return <MagnifyingGlassIcon size={size} />;
    case 'mart':       return <DollarIcon size={size} />;
    case 'npc':        return <GiftIcon size={size} />;
    case 'berry_tree': return <TreeIcon size={size} />;
    default:           return null;
  }
}

// ── Circle (filled circle + white icon) ───────────────────────────────────────

export function MethodCircle({ method, size = 20 }: { method: string; size?: number }) {
  const color = METHOD_COLORS[method];
  if (!color) return null;
  const iconSize = Math.round(size * 0.6);
  return (
    <span
      className="pocket-circle"
      style={{ '--pocket-color': color, '--pocket-circle-size': `${size}px` } as React.CSSProperties}
    >
      <MethodIcon method={method} size={iconSize} />
    </span>
  );
}
