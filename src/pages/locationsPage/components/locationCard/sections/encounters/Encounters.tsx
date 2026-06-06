import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import type { WildEncounterTable } from '../../../../../../services/parsers/v2/locations/types';
import { formatReadableName } from '../../../../../../utils/functions';
import PokemonSprite from '../../../../../../components/elements/sprites/pokemon/PokemonSprite';
import CollapseToggle from '../../../../../../components/elements/collapseToggle/CollapseToggle';
import './../../styles.scss';

type Props = {
  table: WildEncounterTable;
  expandAll?: boolean;
  parentOpen?: boolean;
};

export default function Encounters({ table, expandAll = true, parentOpen = true }: Props) {
  const [open, setOpen] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    if (expandAll || parentOpen) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setOpen(true);
    }
  }, [expandAll, parentOpen]);

  const formatEncounterTableName = (name: string) => {
    let formattedName = formatReadableName(name);
    if (formattedName.includes(' Mons')) {
      formattedName = formattedName.replace(' Mons', '');
    }
    if (formattedName === 'Water') {
      formattedName = 'Surfing';
    }
    if (formattedName.includes('Fishing')) {
      formattedName = formattedName.replace('Fishing', '');
    }
    return formattedName;
  };

  return (
    <div className="section-encounters container-style">
      <div className="section-header" onClick={() => setOpen(!open)}>
        <CollapseToggle isOpen={open} />
        <span>
          {formatEncounterTableName(table.method)} ({table.encounters.length})
        </span>
      </div>

      {open && table.encounters.length > 0 && (
        <div className="table-container">
          <div className="table-wrapper">
            <table className="encounters-table">
              <thead>
                <tr>
                  <th className="left">Pokémon</th>
                  <th className="center">Level</th>
                  <th className="center">Rate</th>
                </tr>
              </thead>
              <tbody>
                {table.encounters.map((mon, i) => {
                  const { minLevel, maxLevel, rate } = mon;
                  const species = mon.pokemon?.name || 'Unknown';

                  return (
                    <tr key={i}>
                      <td>
                        <div
                          className="encounter-mon clickable"
                          onClick={() =>
                            mon.pokemon?.key && navigate(`/pokemon/${mon.pokemon.key}`)
                          }
                        >
                          <PokemonSprite name={species} size={32} />
                          <span>{species}</span>
                        </div>
                      </td>
                      <td>
                        <div>
                          <span className="encounter-level">
                            {minLevel === maxLevel ? minLevel : `${minLevel} - ${maxLevel}`}
                          </span>
                        </div>
                      </td>
                      <td>
                        <div className="encounter-rate">
                          <span>{rate}%</span>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
