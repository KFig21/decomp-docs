import { useEffect, useState } from 'react';
import CollapseToggle from '../../../elements/collapseToggle/CollapseToggle';
import PokemonSprite from '../../../elements/sprites/PokemonSprite';
import type { WildEncounterTable } from '../../../../services/parsers/v2/locations/types';

type Props = {
  table: WildEncounterTable;
  expandAll?: boolean;
  parentOpen?: boolean;
};

export default function Encounters({ table, expandAll = true, parentOpen = true }: Props) {
  const [open, setOpen] = useState(true);

  useEffect(() => {
    if (expandAll || parentOpen) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setOpen(true);
    }
  }, [expandAll, parentOpen]);

  return (
    <div className="section">
      <div className="section-header" onClick={() => setOpen(!open)}>
        <CollapseToggle isOpen={open} />
        <span>
          {table.method} ({table.encounters.length})
        </span>
      </div>

      {open && table.encounters.length > 0 && (
        <table className="encounters-table">
          <thead>
            <tr>
              <th>Pokémon</th>
              <th>Level</th>
              <th>Rate</th>
            </tr>
          </thead>
          <tbody>
            {table.encounters.map((mon, i) => {
              // console.log('Rendering encounter mon:', mon);
              const { minLevel, maxLevel, rate } = mon;
              const species = mon.pokemon?.name || 'Unknown';
              return (
                <tr key={i}>
                  <td className="encounter-mon">
                    <PokemonSprite name={species} size={32} />
                    <span>{species}</span>
                  </td>
                  <td>
                    {minLevel}-{maxLevel}
                  </td>
                  <td>{rate}%</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      )}
    </div>
  );
}
