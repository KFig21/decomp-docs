import type { ParsedTrainerPokemon } from '../../../../../../services/parsers/v2/trainers/types';
import PokemonSprite from '../../../../../elements/sprites/PokemonSprite';
import './styles.scss';

type Props = {
  pokemon: ParsedTrainerPokemon;
};

export default function TrainerPokemonCard({ pokemon }: Props) {
  // console.log('Rendering TrainerPokemonCard for:', pokemon);
  const { species, level, moves = [] } = pokemon;

  return (
    <div className="trainer-pokemon-container">
      <div className="sprite-container">
        <PokemonSprite name={species.name} />
      </div>

      <div className="mon-info">
        <div className="name-lvl">
          <div className="mon-name">{species.name}</div>
          <div className="mon-level">Lv {level}</div>
        </div>
        <div className="ability">
          {/* TODO: Figure out how abilities are determined */}
          <span>{species.abilities ? species.abilities[0].name : 'None'}</span>
        </div>
        <div className="mon-moves">
          {moves.length > 0 &&
            moves.map((move, i) => (
              <div key={i} className="move">
                {move.name}
              </div>
            ))}
        </div>
      </div>
    </div>
  );
}
