import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import type { StaticEncounter } from '../../../../../../services/parsers/v2/locations/types';
import PokemonSprite from '../../../../../../components/elements/sprites/pokemon/PokemonSprite';
import CollapseToggle from '../../../../../../components/elements/collapseToggle/CollapseToggle';
import './../../styles.scss';

type Props = {
  encounters: StaticEncounter[];
  expandAll?: boolean;
  parentOpen?: boolean;
};

export default function StaticEncounters({
  encounters,
  expandAll = true,
  parentOpen = true,
}: Props) {
  const [open, setOpen] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    if (expandAll || parentOpen) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setOpen(true);
    }
  }, [expandAll, parentOpen]);

  if (!encounters || encounters.length === 0) return null;

  return (
    <div className="section-encounters container-style">
      <div className="section-header" onClick={() => setOpen(!open)}>
        <CollapseToggle isOpen={open} />
        <span>Static ({encounters.length})</span>
      </div>

      {open && (
        <div className="table-container">
          <div className="table-wrapper">
            <table className="encounters-table">
              <thead>
                <tr>
                  <th className="left">Pokémon</th>
                  <th className="center">Level</th>
                  <th className="center">Method</th>
                </tr>
              </thead>
              <tbody>
                {encounters.map((enc, i) => (
                  <tr key={i}>
                    <td>
                      <div
                        className="encounter-mon clickable"
                        onClick={() => navigate(`/pokemon/${enc.species.key}`)}
                      >
                        <PokemonSprite name={enc.species.name} size={32} />
                        <span>{enc.species.name}</span>
                      </div>
                    </td>
                    <td>
                      <div className="encounter-level">
                        <span>{enc.level}</span>
                      </div>
                    </td>
                    <td>
                      <div className="encounter-rate">
                        <span>{enc.method}</span>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
