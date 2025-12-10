import PokemonSprite from '../../../../../elements/sprites/PokemonSprite';
import './styles.scss';

type Props = {
  name: string;
  level: number;
  moves: string[];
};

export default function TrainerPokemonCard({ name, level, moves }: Props) {
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
                {move}
              </div>
            ))}
        </div>
      </div>
    </div>
  );
}
