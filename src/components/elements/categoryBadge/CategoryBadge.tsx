/* eslint-disable react-refresh/only-export-components */
import { physicalCategoryIcon } from '../svgIcon/icons/physicalCategoryIcon';
import { specialCategoryIcon } from '../svgIcon/icons/specialCategoryIcon';
import { statusCategoryIcon } from '../svgIcon/icons/statusCategoryIcon';
import './styles.scss';

export type MoveCategory = 'physical' | 'special' | 'status';

type CategoryIcon = { viewBox: string; path: React.ReactNode };

const CATEGORY_SVG: Record<MoveCategory, CategoryIcon> = {
  physical: physicalCategoryIcon,
  special: specialCategoryIcon,
  status: statusCategoryIcon,
};

const CATEGORY_LABEL: Record<MoveCategory, string> = {
  physical: 'Physical',
  special: 'Special',
  status: 'Status',
};

export function normalizeCategory(raw?: string): MoveCategory {
  if (!raw) return 'status';
  const bare = raw
    .toUpperCase()
    .replace(/^DAMAGE_CATEGORY_/, '')
    .replace(/^SPLIT_/, '')
    .trim();
  if (bare === 'PHYSICAL') return 'physical';
  if (bare === 'SPECIAL') return 'special';
  return 'status';
}

const CATEGORY_COLOR: Record<MoveCategory, string> = {
  physical: '#eb5628',
  special: '#375ab2',
  status: '#828282',
};

/** Bare colored SVG icon — no badge pill, just the icon. */
export function CategoryIcon({ raw, size = 14 }: { raw?: string; size?: number }) {
  const cat = normalizeCategory(raw);
  const icon = CATEGORY_SVG[cat];
  return (
    <svg
      width={size}
      height={size}
      viewBox={icon.viewBox}
      fill={CATEGORY_COLOR[cat]}
      aria-hidden="true"
      style={{ display: 'inline-block', verticalAlign: 'middle', flexShrink: 0 }}
    >
      {icon.path}
    </svg>
  );
}

type Props = {
  raw?: string;
  showIcon?: boolean;
  iconOnly?: boolean;
  size?: number;
};

export default function CategoryBadge({
  raw,
  showIcon = false,
  iconOnly = false,
  size = 13,
}: Props) {
  const cat = normalizeCategory(raw);
  const icon = CATEGORY_SVG[cat];

  return (
    <span className={`category-badge category-badge--${cat}`}>
      {(showIcon || iconOnly) && (
        <svg
          width={size}
          height={size}
          viewBox={icon.viewBox}
          fill="currentColor"
          aria-hidden="true"
          style={{ display: 'inline-block', verticalAlign: 'middle', flexShrink: 0 }}
        >
          {icon.path}
        </svg>
      )}
      {!iconOnly && CATEGORY_LABEL[cat]}
    </span>
  );
}
