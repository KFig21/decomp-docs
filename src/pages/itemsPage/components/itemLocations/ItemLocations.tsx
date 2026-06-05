/* eslint-disable @typescript-eslint/no-explicit-any */
import { useState } from 'react';
import { Link } from 'react-router-dom';
import './styles.scss';

type Props = { locations?: any[] };

// mod maps the data method key -> CSS class suffix
// berry_tree (underscore) -> berry-tree (hyphen) to match SCSS map key
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
  const [activeMethod, setActiveMethod] = useState<string | null>(null);

  if (!locations || locations.length === 0) return null;

  const methodCounts: Record<string, number> = {};
  for (const loc of locations) {
    methodCounts[loc.method] = (methodCounts[loc.method] ?? 0) + 1;
  }

  const displayed = activeMethod ? locations.filter((l) => l.method === activeMethod) : locations;

  const toggleMethod = (method: string) =>
    setActiveMethod((prev) => (prev === method ? null : method));

  return (
    <div className="item-card-style item-locations">
      <div className="section-header">
        <span>Locations</span>
        <div className="method-summary">
          {Object.entries(methodCounts).map(([method, count]) => {
            const meta = METHOD_META[method] ?? { label: method, icon: '📦', mod: 'other' };
            const isActive = activeMethod === method;
            return (
              <button
                key={method}
                className={`method-chip method-chip--${meta.mod} ${isActive ? 'method-chip--active' : ''}`}
                onClick={() => toggleMethod(method)}
                title={isActive ? 'Click to show all' : `Filter to ${meta.label} only`}
              >
                {meta.icon} {meta.label} ×{count}
              </button>
            );
          })}
          {activeMethod && (
            <button
              className="method-chip method-chip--clear"
              onClick={() => setActiveMethod(null)}
            >
              ✕ Clear filter
            </button>
          )}
        </div>
      </div>

      <div className="content">
        {displayed.length === 0 ? (
          <p className="no-results">No locations match this filter.</p>
        ) : (
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
              {displayed.map((loc, i) => {
                const mod = METHOD_META[loc.method]?.mod ?? 'other';
                return (
                  <tr key={i} className={`loc-row loc-row--${mod}`}>
                    <td>
                      <Link to={`/locations/${loc.location}`} className="location-link">
                        {loc.location}
                      </Link>
                    </td>
                    <td className="map-name">{loc.map}</td>
                    <td className="center">
                      <MethodBadge method={loc.method} />
                    </td>
                    <td className="center qty-cell">
                      {loc.method === 'mart' ? '∞' : loc.quantity}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
