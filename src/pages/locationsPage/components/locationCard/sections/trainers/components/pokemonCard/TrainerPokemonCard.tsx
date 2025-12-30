import type { ParsedTrainerPokemon } from '../../../../../../../../services/parsers/v2/trainers/types';
import PokemonSprite from '../../../../../../../../components/elements/sprites/PokemonSprite';
import './styles.scss';

type Props = {
  pokemon: ParsedTrainerPokemon;
};

const MAX_MOVES = 4;

export default function TrainerPokemonCard({ pokemon }: Props) {
  // console.log('Rendering TrainerPokemonCard for:', pokemon);
  const { species, level, moves = [] } = pokemon;

  return (
    <div className="trainer-pokemon-container">
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
        {/* Nature */}
        {/* TODO: Figure out how NATURES are determined */}
        {/* <div className="nature-container">
          <div className="mon-info-detail">{pokemon.nature ? pokemon.nature.name : 'Nature'}</div>
        </div> */}
        {/* Ability */}
        {/* TODO: Figure out how ABILITIES are determined */}
        <div className="ability-container">
          <div className="mon-info-detail">
            {species.abilities ? species.abilities[0].name : 'None'}
          </div>
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
