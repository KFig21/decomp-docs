import { useEffect, useState } from 'react';
import type { WildPokemon } from '../../../../types/decomp';
import CollapseToggle from '../../../elements/collapseToggle/CollapseToggle';
import PokemonSprite from '../../../elements/sprites/PokemonSprite';

type Props = {
  encounters: WildPokemon[];
  expandAll?: boolean;
  parentOpen?: boolean;
};

export default function Encounters({ encounters, expandAll = true, parentOpen = true }: Props) {
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
        <span>Encounters ({encounters.length})</span>
      </div>

      {open && encounters.length > 0 && (
        <table className="encounters-table">
          <thead>
            <tr>
              <th>Pokémon</th>
              <th>Level</th>
              <th>Rate</th>
            </tr>
          </thead>
          <tbody>
            {encounters.map((mon, i) => (
              <tr key={i}>
                <td className="encounter-mon">
                  <PokemonSprite name={mon.species} size={32} />
                  <span>{mon.species}</span>
                </td>
                <td>{mon.level}</td>
                <td>{mon.rate}%</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}
