import { Link } from 'react-router-dom';
import TypeIconBadge from './TypeIconBadge';
import { formatType } from '../../../utils/functions';
import './styles.scss';

type Props = {
  type: string;
  noLink?: boolean;
};

function normalizeTypeSlug(raw: string): string {
  return raw.replace(/^TYPE_/i, '').toLowerCase();
}

export default function TypeBadge({ type, noLink = false }: Props) {
  if (!type) return null;
  const slug = normalizeTypeSlug(type);
  const className = `type-badge type-${type.toLowerCase()}`;

  const inner = (
    <>
      <TypeIconBadge type={type} size={12} />
      {formatType(type)}
    </>
  );

  if (noLink) {
    return <span className={className}>{inner}</span>;
  }

  return (
    <Link
      to={`/types/${slug}`}
      className={className}
      onClick={(e) => e.stopPropagation()}
    >
      {inner}
    </Link>
  );
}
