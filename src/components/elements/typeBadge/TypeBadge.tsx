import { formatType } from '../../../utils/functions';
import './styles.scss';

export default function TypeBadge({ type }: { type: string }) {
  if (!type) return null;
  return <span className={`type-badge type-${type.toLowerCase()}`}>{formatType(type)}</span>;
}
