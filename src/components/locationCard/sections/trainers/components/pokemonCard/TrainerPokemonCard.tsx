import type { ParsedTrainerPokemon } from '../../../../../../services/parsers/v2/trainers/types';
import PokemonSprite from '../../../../../elements/sprites/PokemonSprite';
import './styles.scss';

type Props = {
  pokemon: ParsedTrainerPokemon;
};

export default function TrainerPokemonCard({ pokemon }: Props) {
  const { species: name, level, moves = [] } = pokemon;
  return (
    <div className="trainer-pokemon-container">
      <div className="sprite-container">
        <PokemonSprite name={name} />
      </div>

      <div className="mon-info">
        <div className="name-lvl">
          <div className="mon-name">{name}</div>
          <div className="mon-level">Lv {level}</div>
        </div>
        <div className="mon-moves">
          {moves.length > 0 &&
            moves.map((move, i) => (
              <div key={i} className="move">
                {/* TODO - Move name lookup */}
                {move.key}
              </div>
            ))}
        </div>
      </div>
    </div>
  );
}
