import { useNavigate } from 'react-router-dom';
import type { ParsedTrainerPokemon } from '../../../../../../../../services/parsers/v2/trainers/types';
import PokemonSprite from '../../../../../../../../components/elements/sprites/pokemon/PokemonSprite';
import './styles.scss';

type Props = {
  pokemon: ParsedTrainerPokemon;
  highlight?: boolean;
};

const MAX_MOVES = 4;

export default function TrainerPokemonCard({ pokemon, highlight }: Props) {
  const { species, level, moves = [] } = pokemon;
  const navigate = useNavigate();

  return (
    <div
      className={`trainer-pokemon-container ${highlight ? 'highlighted' : ''}`}
      onClick={() => navigate(`/pokemon/${species.key}`)}
    >
      <div className="sprite-wrapper">
        <div className="sprite-container">
          <PokemonSprite name={species.name} />
        </div>
      </div>
      <div className="mon-info">
        {/* Name */}
        <div className="name-container">
          <div className="mon-info-detail">{species.name}</div>
        </div>

        {/* Level */}
        <div className="lvl-container">
          <div className="mon-info-detail">Level {level}</div>
        </div>

        {/* Ability */}
        <div className="ability-container">
          <div className="mon-info-detail">{species.abilities?.[0]?.name ?? 'None'}</div>
        </div>

        {/* Moves */}
        <div className="mon-moves">
          {Array.from({ length: MAX_MOVES }).map((_, i) => {
            const move = moves[i];
            return (
              <div key={i} className={`move ${!move ? 'empty' : ''}`}>
                {move ? move.name : '—'}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
