/* eslint-disable @typescript-eslint/no-explicit-any */
import { useState } from 'react';
import { Link } from 'react-router-dom';
import { MethodCircle, METHOD_LABELS } from '../../../../components/elements/itemMethodIcon/ItemMethodIcon';
import './styles.scss';

type Props = { locations?: any[] };

// Data uses underscores (berry_tree); CSS classes use hyphens (berry-tree).
const methodKey = (method: string) => method.replace(/_/g, '-');

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
            const label = METHOD_LABELS[method] ?? method;
            const isActive = activeMethod === method;
            return (
              <button
                key={method}
                className={`method-chip method-chip--${methodKey(method)} ${isActive ? 'method-chip--active' : ''}`}
                onClick={() => toggleMethod(method)}
                title={isActive ? 'Click to show all' : `Filter to ${label} only`}
              >
                <MethodCircle method={method} size={16} />
                {label} ×{count}
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
                return (
                  <tr key={i} className={`loc-row loc-row--${methodKey(loc.method)}`}>
                    <td>
                      <Link to={`/locations/${loc.location}`} className="location-link">
                        {loc.location}
                      </Link>
                    </td>
                    <td className="map-name">{loc.map}</td>
                    <td className="center">
                      <div className="method-cell">
                        <MethodCircle method={loc.method} size={18} />
                        <span className="method-label">{METHOD_LABELS[loc.method] ?? loc.method}</span>
                      </div>
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
