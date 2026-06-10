export type MoveCategory = 'physical' | 'special' | 'status';

const CATEGORY_ICON: Record<MoveCategory, string> = {
  physical: '⚔️',
  special: '✨',
  status: '🔮',
};

const CATEGORY_LABEL: Record<MoveCategory, string> = {
  physical: 'Physical',
  special: 'Special',
  status: 'Status',
};

export function normalizeCategory(raw?: string): MoveCategory {
  if (!raw) return 'status';
  const bare = raw.toUpperCase().replace(/^DAMAGE_CATEGORY_/, '').replace(/^SPLIT_/, '').trim();
  if (bare === 'PHYSICAL') return 'physical';
  if (bare === 'SPECIAL') return 'special';
  return 'status';
}

type Props = {
  raw?: string;
  showIcon?: boolean;
};

import './styles.scss';

export default function CategoryBadge({ raw, showIcon = false }: Props) {
  const cat = normalizeCategory(raw);
  return (
    <span className={`category-badge category-badge--${cat}`}>
      {showIcon && <span className="category-badge__icon">{CATEGORY_ICON[cat]}</span>}
      {CATEGORY_LABEL[cat]}
    </span>
  );
}
