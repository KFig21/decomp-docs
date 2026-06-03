/* eslint-disable @typescript-eslint/no-explicit-any */
import { Link } from 'react-router-dom';

type Props = {
  locations?: any[];
};

export default function ItemLocations({ locations }: Props) {
  if (!locations || locations.length === 0) return null;

  return (
    <div className="item-card-style">
      <div className="section-header">Locations</div>
      <div className="content">
        <table className="data-table">
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
              <tr key={i}>
                <td>
                  <Link to={`/locations/${loc.location}`} className="location-link">
                    {loc.location}
                  </Link>
                </td>
                <td>{loc.map}</td>
                <td className="center capitalize">{loc.method}</td>
                <td className="center">{loc.quantity}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
