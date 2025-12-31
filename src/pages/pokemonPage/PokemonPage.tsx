import { useNavigate } from 'react-router-dom';
import { useData } from '../../contexts/dataContext';
import './styles.scss';
import PokemonSprite from '../../components/elements/sprites/PokemonSprite';
import { formatType } from '../../utils/functions';

export default function PokemonPage() {
  const { pokemon } = useData();
  const navigate = useNavigate();

  return (
    <div className="pokemon-page">
      <div className="page-content">
        <div className="toolbar">filter</div>

        <div className="pokemon-list">
          {pokemon.length === 0 && <p>No Pokémon loaded yet.</p>}

          {Object.values(pokemon).map((mon) => {
            const uniqueTypes = Array.from(new Set(mon.types ?? []));

            return (
              <div
                key={mon.key}
                className="pokemon-list-item"
                onClick={() => navigate(`/pokemon/${mon.key}`)}
              >
                <PokemonSprite name={mon.name} />
                <div className="pokemon-name">{mon.name}</div>

                <div className="pokemon-types">
                  {uniqueTypes.map((type) => (
                    <div key={type} className={`type-badge type-${type}`}>
                      {formatType(type ? type : '')}
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
