/* eslint-disable react-refresh/only-export-components */
import '../itemPocketIcon/styles.scss';
import './styles.scss';
import RockIcon from './icons/RockIcon';
import MagnifyingGlassIcon from './icons/MagnifyingGlassIcon';
import DollarIcon from './icons/DollarIcon';
import GiftIcon from './icons/GiftIcon';
import TreeIcon from './icons/TreeIcon';

// ── Labels ────────────────────────────────────────────────────────────────────

export const METHOD_LABELS: Record<string, string> = {
  overworld:  'Overworld',
  hidden:     'Hidden',
  mart:       'Mart',
  npc:        'NPC Gift',
  berry_tree: 'Berry Tree',
};

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

// ── Circle — filled circle + white icon, colored via CSS class ────────────────

export function MethodCircle({ method, size = 20 }: { method: string; size?: number }) {
  if (!METHOD_LABELS[method]) return null;
  const cssKey = method.replace(/_/g, '-');
  const iconSize = Math.round(size * 0.6);
  return (
    <span
      className={`pocket-circle pocket-circle--${cssKey}`}
      style={{ width: size, height: size }}
    >
      <MethodIcon method={method} size={iconSize} />
    </span>
  );
}
