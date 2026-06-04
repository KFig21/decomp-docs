// decomp-docs/src/pages/itemsPage/components/itemLocations/ItemLocations.tsx
/* eslint-disable @typescript-eslint/no-explicit-any */
import { Link } from 'react-router-dom';
import './styles.scss';

type Props = {
  locations?: any[];
};

// Method metadata: label, icon (emoji for zero-dep), css modifier
const METHOD_META: Record<string, { label: string; icon: string; mod: string }> = {
  overworld: { label: 'Overworld', icon: '🌿', mod: 'overworld' },
  hidden: { label: 'Hidden', icon: '🔍', mod: 'hidden' },
  mart: { label: 'Mart', icon: '🛒', mod: 'mart' },
  npc: { label: 'NPC Gift', icon: '🎁', mod: 'npc' },
  berry_tree: { label: 'Berry Tree', icon: '🍒', mod: 'berry-tree' },
};

function MethodBadge({ method }: { method: string }) {
  const meta = METHOD_META[method] ?? { label: method, icon: '📦', mod: 'other' };
  return (
    <span className={`method-badge method-badge--${meta.mod}`}>
      <span className="method-badge__icon">{meta.icon}</span>
      {meta.label}
    </span>
  );
}

export default function ItemLocations({ locations }: Props) {
  if (!locations || locations.length === 0) return null;

  // Group by method for the summary chips
  const methodCounts: Record<string, number> = {};
  for (const loc of locations) {
    methodCounts[loc.method] = (methodCounts[loc.method] ?? 0) + 1;
  }

  return (
    <div className="item-card-style item-locations">
      <div className="section-header">
        <span>Locations</span>
        <div className="method-summary">
          {Object.entries(methodCounts).map(([method, count]) => {
            const meta = METHOD_META[method] ?? { label: method, icon: '📦', mod: 'other' };
            return (
              <span key={method} className={`method-chip method-chip--${meta.mod}`}>
                {meta.icon} {meta.label} ×{count}
              </span>
            );
          })}
        </div>
      </div>
      <div className="content">
        <table className="data-table locations-table">
          <thead>
            <tr>
              <th className="left">Location</th>
              <th className="left">Map</th>
              <th className="center">Method</th>
              <th className="center">Qty</th>
            </tr>
          </thead>
          <tbody>
            {locations.map((loc, i) => (
              <tr key={i} className={`loc-row loc-row--${METHOD_META[loc.method]?.mod ?? 'other'}`}>
                <td>
                  <Link to={`/locations/${loc.location}`} className="location-link">
                    {loc.location}
                  </Link>
                </td>
                <td className="map-name">{loc.map}</td>
                <td className="center">
                  <MethodBadge method={loc.method} />
                </td>
                <td className="center qty-cell">{loc.method === 'mart' ? '∞' : loc.quantity}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
