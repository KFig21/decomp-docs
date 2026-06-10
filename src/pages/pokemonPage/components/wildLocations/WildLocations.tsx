/* eslint-disable @typescript-eslint/no-explicit-any */
import { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { useData } from '../../../../contexts/dataContext';
import CollapseToggle from '../../../../components/elements/collapseToggle/CollapseToggle';
import { formatReadableName } from '../../../../utils/functions';

type Props = {
  selectedKey: string;
};

const formatEncounterTableName = (name: string) => {
  let formattedName = formatReadableName(name);
  if (formattedName.includes(' Mons')) formattedName = formattedName.replace(' Mons', '');
  if (formattedName === 'Water') formattedName = 'Surfing';
  if (formattedName.includes('Fishing')) formattedName = formattedName.replace('Fishing', '');
  return formattedName;
};

export default function WildLocations({ selectedKey }: Props) {
  const { locations } = useData();
  const [isOpen, setIsOpen] = useState(true);

  const resolvedLocations = useMemo(() => {
    const rawEncounters: any[] = [];
    const locationsArray = (
      Array.isArray(locations) ? locations : Object.values(locations)
    ) as any[];

    locationsArray.forEach((locRoot: any) => {
      Object.values(locRoot.maps || {}).forEach((map: any) => {
        const locationDisplay =
          locRoot.root === map.name
            ? formatReadableName(locRoot.root)
            : `${formatReadableName(locRoot.root)} (${formatReadableName(map.name)})`;
        const locationKey: string = locRoot.root;

        (map.wildPokemon || []).forEach((table: any) => {
          table.encounters.forEach((enc: any) => {
            if (enc.pokemon?.key === selectedKey) {
              rawEncounters.push({
                locationName: locationDisplay,
                locationKey,
                method: formatEncounterTableName(table.method),
                minLevel: enc.minLevel,
                maxLevel: enc.maxLevel,
                rate: enc.rate,
              });
            }
          });
        });

        (map.staticEncounters || []).forEach((enc: any) => {
          if (enc.species?.key === selectedKey) {
            rawEncounters.push({
              locationName: locationDisplay,
              locationKey,
              method: enc.method,
              minLevel: enc.level,
              maxLevel: enc.level,
              rate: 100,
            });
          }
        });
      });
    });

    return Array.from(new Map(rawEncounters.map((e) => [JSON.stringify(e), e])).values());
  }, [locations, selectedKey]);

  return (
    <div className={`section pokemon-card-style ${isOpen ? '' : 'collapsed'}`}>
      <div className="section-header" onClick={() => setIsOpen(!isOpen)}>
        <CollapseToggle isOpen={isOpen} />
        <span>Wild Locations ({resolvedLocations.length})</span>
      </div>
      {isOpen && (
        <div className="table-container content">
          {resolvedLocations.length > 0 ? (
            <table className="data-table">
              <thead>
                <tr>
                  <th className="left">Location</th>
                  <th className="left">Method</th>
                  <th className="center">Level</th>
                  <th className="center">Rate</th>
                </tr>
              </thead>
              <tbody>
                {resolvedLocations.map((enc: any, i: number) => (
                  <tr key={i}>
                    <td>
                      <Link to={`/locations/${enc.locationKey}`} className="table-location-link">
                        {enc.locationName}
                      </Link>
                    </td>
                    <td>{enc.method}</td>
                    <td className="center">
                      {enc.minLevel === enc.maxLevel
                        ? enc.minLevel
                        : `${enc.minLevel} - ${enc.maxLevel}`}
                    </td>
                    <td className="center">{enc.rate}%</td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <p className="empty-state">Cannot be found in the wild.</p>
          )}
        </div>
      )}
    </div>
  );
}
