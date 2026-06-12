// decomp-docs/src/pages/movesPage/components/moveTmInfo/MoveTmInfo.tsx
/* eslint-disable @typescript-eslint/no-explicit-any */
import { Link } from 'react-router-dom';
import ItemSprite from '../../../../components/elements/sprites/ItemSprite';
import './styles.scss';

type Props = {
  tmItem: any;
  move:   any;
};

const METHOD_META: Record<string, { label: string; icon: string }> = {
  overworld:  { label: 'Overworld', icon: '🌿' },
  hidden:     { label: 'Hidden',    icon: '🔍' },
  mart:       { label: 'Mart',      icon: '🛒' },
  npc:        { label: 'NPC Gift',  icon: '🎁' },
  berry_tree: { label: 'Berry Tree',icon: '🍒' },
};

export default function MoveTmInfo({ tmItem }: Props) {
  const isHm = tmItem.key?.startsWith('ITEM_HM');

  // Extract TM number from key: ITEM_TM26_EARTHQUAKE → 26
  const tmNumMatch = tmItem.key?.match(/ITEM_(?:TM|HM)(\d+)/);
  const tmNum = tmNumMatch ? Number(tmNumMatch[1]) : null;

  const locations: any[] = tmItem.locations ?? [];

  return (
    <div className="move-card-style move-tm-info">
      <div className="section-header">
        <ItemSprite item={tmItem} size={28} />
        <Link to={`/items/${tmItem.key}`} className="tm-item-link">
          {isHm ? 'HM' : 'TM'}{tmNum != null ? String(tmNum).padStart(2, '0') : ''} — {tmItem.name}
        </Link>
      </div>
      <div className="content">
        <div className="tm-meta-row">
          <div className="tm-price-block">
            <span className="tm-label">Buy Price</span>
            <span className="tm-value">{tmItem.price ? `₽${tmItem.price.toLocaleString()}` : '—'}</span>
          </div>
          <div className="tm-price-block">
            <span className="tm-label">Sell Price</span>
            <span className="tm-value sell">{tmItem.sellPrice ? `₽${tmItem.sellPrice.toLocaleString()}` : '—'}</span>
          </div>
        </div>

        {locations.length > 0 ? (
          <table className="data-table tm-locations-table">
            <thead>
              <tr>
                <th>Location</th>
                <th>Map</th>
                <th className="center">Method</th>
                <th className="center">Qty</th>
              </tr>
            </thead>
            <tbody>
              {locations.map((loc: any, i: number) => {
                const meta = METHOD_META[loc.method] ?? { label: loc.method, icon: '📦' };
                return (
                  <tr key={i}>
                    <td><Link to={`/locations/${loc.location}`} className="location-link">{loc.location}</Link></td>
                    <td className="map-name">{loc.map}</td>
                    <td className="center">{meta.icon} {meta.label}</td>
                    <td className="center">{loc.method === 'mart' ? '∞' : loc.quantity}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        ) : (
          <p className="empty-state">No location data found for this TM.</p>
        )}
      </div>
    </div>
  );
}
