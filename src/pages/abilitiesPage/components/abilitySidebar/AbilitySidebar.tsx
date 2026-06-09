/* eslint-disable @typescript-eslint/no-explicit-any */
import { Link } from 'react-router-dom';
import './styles.scss';

type Props = {
  filteredAbilities: any[];
  activeId?: string;
  pokemonCountByAbility: Record<string, number>;
};

export default function AbilitySidebar({ filteredAbilities, activeId, pokemonCountByAbility }: Props) {
  return (
    <div className="abilities-sidebar">
      {filteredAbilities.map((ability) => {
        const count = pokemonCountByAbility[ability.key] ?? 0;
        return (
          <Link
            key={ability.key}
            to={`/abilities/${ability.key}`}
            className={`abilities-sidebar-item ${activeId === ability.key ? 'active' : ''}`}
          >
            <span className="ability-name">{ability.name || ability.key}</span>
            {count > 0 && <span className="ability-pokemon-count">{count}</span>}
          </Link>
        );
      })}
    </div>
  );
}
